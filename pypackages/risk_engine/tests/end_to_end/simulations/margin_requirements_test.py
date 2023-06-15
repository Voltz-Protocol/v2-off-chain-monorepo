import unittest

from risk_engine.src.simulations.margin_requirements.MarginRequirements import MarginRequirements
from risk_engine.tests.end_to_end.simulations.constants import COLLATERAL_TOKEN, INITIAL_FIXED_RATE, RISK_PARAMETER, IM_MULTIPLIER, SLIPPAGE_PHI, SLIPPAGE_BETA, LP_SPREAD, IS_TRADER_VT, MAKER_FEE, TAKER_FEE, GWAP_LOOKBACK, LIQUIDATOR_REWARD
from pandas import DataFrame
from risk_engine.src.constants import FIRST_MAINNET_POS_BLOCK_TIMESTAMP, MONTH_IN_SECONDS

OUTPUT_FOLDER = 'results'

class MarginRequirementsRunnerTest(unittest.TestCase):

    def setUp(self):

        self.margin_requirements_sim: MarginRequirements = MarginRequirements()
        self.margin_requirements_sim.setUp(
            collateral_token=COLLATERAL_TOKEN,
            initial_fixed_rate=INITIAL_FIXED_RATE,
            risk_parameter=RISK_PARAMETER,
            im_multiplier=IM_MULTIPLIER,
            slippage_phi=SLIPPAGE_PHI,
            slippage_beta=SLIPPAGE_BETA,
            lp_spread=LP_SPREAD,
            is_trader_vt=IS_TRADER_VT,
            timestamps=[FIRST_MAINNET_POS_BLOCK_TIMESTAMP, FIRST_MAINNET_POS_BLOCK_TIMESTAMP + MONTH_IN_SECONDS],
            indices=[1.0, 1.00001],
            maker_fee=MAKER_FEE,
            taker_fee=TAKER_FEE,
            gwap_lookback=GWAP_LOOKBACK,
            liquidator_reward=LIQUIDATOR_REWARD
        )

    def test_full_run(self):

        output: DataFrame = self.margin_requirements_sim.run(output_folder=OUTPUT_FOLDER)

        # 'timestamp', 'date', 'lp_liquidation_threshold', 'lp_safety_threshold',
        # 'lp_uPnL', 'trader_liquidation_threshold', 'trader_safety_threshold',
        # 'trader_uPnL', 'lp_settlement_cashflow', 'trader_settlement_cashflow']
        # 1663220562,2022-09-15 06:42:42,8.21918,12.32877,-0.04110,1.64384,2.46575,0.04110,4.14068,-4.14068

        # todo: write tests for individual calculations that feed into this flow and then get back here