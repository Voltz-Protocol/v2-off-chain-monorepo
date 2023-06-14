import datetime
import os

import matplotlib.pyplot as plt
import pandas as pd

from accounts.AccountManager import AccountManager
from block import Block
from fees.FeeManager import FeeManager
from margin_engine.CollateralEngine import CollateralEngine
from margin_engine.LiquidationEngine import LiquidationEngine
from markets.IRSMarket import IRSMarket
from markets.MarketManager import MarketManager
from oracle import Oracle
from pools.IRSPool import IRSPool
from price_oracle import PriceOracle

"""
This simulation has the following assumptions and series of actions:
    - There's one market and one pool on top of given interest indices

    - There are two actors, Alice (maker) and Bob(taker)
    - Alice mints liquidity in the pool
    - Bob trades

    - The simulation checks the margin requirements and uPnL over time
"""


class MarginRequirements:
    def setUp(
        self,
        collateral_token,
        initial_fixed_rate,
        risk_parameter,
        im_multiplier,
        slippage_phi,
        slippage_beta,
        lp_spread,
        is_trader_vt,
        timestamps,
        indices,
        maker_fee,
        taker_fee,
        gwap_lookback
    ):
        # Generate the modules
        self.block = Block(relative_block_position=0)

        # Sanity check the indices
        if not len(timestamps) == len(indices):
            raise Exception("margin requirements: timestamps and indices do not have same length")

        if not (collateral_token == "ETH" or collateral_token == "USDC"):
            raise Exception("margin requirements: token {0} is not supported yet".format(collateral_token))

        for i in range(1, len(timestamps)):
            if timestamps[i - 1] > timestamps[i]:
                raise Exception(
                    "margin requirements: timestamps are not chronological. (indices {0}-{1})".format(
                        i - 1, i
                    )
                )

        self.observations = []
        for i in range(len(timestamps)):
            self.observations.append([timestamps[i], indices[i]])

        duration = self.observations[-1][0] - self.observations[0][0]

        # Build the infrastructure
        self.oracle = Oracle(block=self.block, initial_observations=[])

        self.block.skip_forward_time(time_to_move_forward=self.observations[0][0] - self.block.timestamp)
        self.oracle.capture_rate(rate=self.observations[0][1])

        self.current_observation_index = 0

        self.account_manager = AccountManager()
        self.fee_manager = FeeManager()
        self.price_oracle = PriceOracle()
        self.collateral_engine = CollateralEngine()
        self.liquidation_engine = LiquidationEngine()
        self.market_manager = MarketManager()

        # Set up the account manager
        self.account_manager.set_market_manager(market_manager=self.market_manager)

        # Set up the fee manager
        self.fee_manager.set_fee_collector_account_id_of_protocol(fee_collector_protocol="protocol")

        self.fee_manager.set_atomic_maker_taker_fees(
            market_id="market_irs",
            # 0% maker fees
            new_atomic_maker_fee=maker_fee,
            # 0% taker fees
            new_atomic_taker_fee=taker_fee,
        )

        # Set up collateral engine
        self.collateral_engine.set_account_manager(account_manager=self.account_manager)

        self.collateral_engine.set_liquidation_engine(liquidation_engine=self.liquidation_engine)

        self.collateral_engine.set_price_oracle(price_oracle=self.price_oracle)

        # Set up liquidation engine
        self.liquidation_engine.set_account_manager(account_manager=self.account_manager)

        self.liquidation_engine.set_collateral_engine(collateral_engine=self.collateral_engine)

        self.liquidation_engine.set_IM_multiplier(im_multiplier=im_multiplier)

        # Set up IRS market
        self.market_irs = IRSMarket(
            block=self.block,
            market_id="market_irs",
            base_token=collateral_token,
            quote_token=collateral_token,
        )

        self.market_irs.set_collateral_engine(collateral_engine=self.collateral_engine)
        self.market_irs.set_liquidation_engine(liquidation_engine=self.liquidation_engine)
        self.market_irs.set_oracle(oracle=self.oracle)
        self.market_irs.set_account_manager(account_manager=self.account_manager)
        self.market_irs.set_fee_manager(fee_manager=self.fee_manager)
        self.market_irs.set_price_oracle(price_oracle=self.price_oracle)

        # Set up IRS pool

        self.pool_irs_maturity = self.block.timestamp + duration

        self.pool_irs = IRSPool(
            pool_id="pool_irs",
            block=self.block,
            min_tick=0,
            max_tick=100000,
            tick_spacing=10,
            term_end_in_seconds=self.pool_irs_maturity,
            oracle=self.oracle,
            gwap_lookback=gwap_lookback
        )

        initial_tick = self.pool_irs.tick_at_price(initial_fixed_rate)
        self.pool_irs.initialize(current_tick=initial_tick)

        self.initial_fixed_rate = self.pool_irs.price_at_tick(tick=initial_tick)

        self.market_irs.register_pool(pool=self.pool_irs)

        self.market_irs.set_slippage_phi(slippage_phi=slippage_phi)
        self.market_irs.set_slippage_beta(slippage_beta=slippage_beta)

        # Set up market manager
        self.market_manager.register_market(market=self.market_irs)

        # Set up account
        self.alice = self.account_manager.create_account(account_id="alice", base_token=collateral_token)

        self.bob = self.account_manager.create_account(account_id="bob", base_token=collateral_token)

        # Set up risk mapping
        self.liquidation_engine.set_risk_mapping(
            risk_mapping={"market_irs": {self.pool_irs_maturity: risk_parameter}}
        )

        # Store the simulation metrics
        self.lp_spread = lp_spread
        self.is_trader_vt = is_trader_vt

    def advance_to_next_observation(self):
        if self.current_observation_index + 1 == len(self.observations):
            raise Exception("margin requirements: no more observations to advance")

        time_to_move_forward = (
            self.observations[self.current_observation_index + 1][0]
            - self.observations[self.current_observation_index][0]
        )

        # System: Advance time
        self.block.skip_forward_time(time_to_move_forward=time_to_move_forward)

        # System: Set new rate
        self.oracle.capture_rate(rate=self.observations[self.current_observation_index + 1][1])

        self.current_observation_index += 1

    def run(self, output_folder):

        # Alice: Deposit margin
        alice_collateral = 1000
        self.collateral_engine.deposit_collateral(account_id=self.alice.account_id, amount=alice_collateral)

        # Alice: Mint between [F-spread, F+spread] on IRS market
        lp_notional = 10000

        self.market_irs.process_limit_order(
            pool_id="pool_irs",
            maturity=self.pool_irs_maturity,
            account_id="alice",
            base=lp_notional / self.oracle.latest(),
            lower_price=self.initial_fixed_rate - self.lp_spread,
            upper_price=self.initial_fixed_rate + self.lp_spread,
        )

        # Bob: Deposit margin
        bob_collateral = 1000
        self.collateral_engine.deposit_collateral(account_id=self.bob.account_id, amount=bob_collateral)

        # Bob: Trade
        trade_notional = 1000 if self.is_trader_vt else -1000

        self.market_irs.process_market_order(
            pool_id="pool_irs",
            maturity=self.pool_irs_maturity,
            account_id="bob",
            base=trade_notional / self.oracle.latest(),
        )

        output = pd.DataFrame()
        timestamps = []
        lp_liquidation_threshold = []
        lp_safety_threshold = []
        lp_uPnL = []
        trader_liquidation_threshold = []
        trader_safety_threshold = []
        trader_uPnL = []

        while self.current_observation_index + 1 < len(self.observations):
            alice_st, alice_lt = self.liquidation_engine.get_account_margin_requirements(account_id="alice")
            bob_st, bob_lt = self.liquidation_engine.get_account_margin_requirements(account_id="bob")

            alice_uPnL = self.account_manager.get_account(account_id="alice").get_account_unrealized_pnl()
            bob_uPnL = self.account_manager.get_account(account_id="bob").get_account_unrealized_pnl()

            timestamps.append(self.block.timestamp)
            lp_liquidation_threshold.append(alice_lt)
            lp_safety_threshold.append(alice_st)
            lp_uPnL.append(alice_uPnL)
            trader_liquidation_threshold.append(bob_lt)
            trader_safety_threshold.append(bob_st)
            trader_uPnL.append(bob_uPnL)

            # System: Advance 1 day
            self.advance_to_next_observation()

        # Alice: Settle
        alice_sc = self.collateral_engine.get_account_collateral(account_id="alice")
        self.market_irs.settle(maturity=self.pool_irs_maturity, account_id="alice")
        alice_sc = self.collateral_engine.get_account_collateral(account_id="alice") - alice_sc

        # Bob: Settle
        bob_sc = self.collateral_engine.get_account_collateral(account_id="bob")
        self.market_irs.settle(maturity=self.pool_irs_maturity, account_id="bob")
        bob_sc = self.collateral_engine.get_account_collateral(account_id="bob") - bob_sc

        output["timestamp"] = timestamps
        output["date"] = [datetime.datetime.fromtimestamp(ts) for ts in timestamps]
        output["lp_liquidation_threshold"] = lp_liquidation_threshold
        output["lp_safety_threshold"] = lp_safety_threshold
        output["lp_uPnL"] = lp_uPnL
        output["trader_liquidation_threshold"] = trader_liquidation_threshold
        output["trader_safety_threshold"] = trader_safety_threshold
        output["trader_uPnL"] = trader_uPnL
        output["lp_settlement_cashflow"] = [alice_sc] * len(timestamps)
        output["trader_settlement_cashflow"] = [bob_sc] * len(timestamps)

        if not os.path.exists(output_folder):
            os.mkdir(output_folder)

        output.to_csv("{0}/output.csv".format(output_folder), index=False)

        output.plot(x="date", y=["lp_liquidation_threshold", "lp_safety_threshold"])
        plt.savefig("{0}/lp_margin_requirements.png".format(output_folder))
        plt.cla()

        output.plot(x="date", y=["trader_liquidation_threshold", "trader_safety_threshold"])
        plt.savefig("{0}/trader_margin_requirements.png".format(output_folder))
        plt.cla()

        output.plot(x="date", y=["lp_uPnL", "lp_settlement_cashflow"])
        plt.savefig("{0}/lp_cashflows.png".format(output_folder))
        plt.cla()

        output.plot(x="date", y=["trader_uPnL", "trader_settlement_cashflow"])
        plt.savefig("{0}/trader_cashflows.png".format(output_folder))
        plt.cla()

        return output # Return the time series dataframe