

class CollateralModule:
    def __init__(self):

        self.account_manager = None
        self.price_oracle = None
        self.liquidation_module = None
        self._account_collateral_balance_mapping = {}

    def get_account_collateral_balance(self, account_id):
        if account_id not in self._account_collateral_balance_mapping:
            return 0

        return self._account_collateral_balance_mapping[account_id]

    def _update_account_collateral(self, account_id, amount):
        if account_id not in self._account_collateral_balance_mapping:
            self._account_collateral_balance_mapping[account_id] = 0

        self._account_collateral_balance_mapping[account_id] += amount

        if self._account_collateral_balance_mapping[account_id] < 0:
            raise Exception("Collateral cannot be negative")

    def distribute_fees(self, fee_debits_and_credits):
        for fee_debit_or_credit in fee_debits_and_credits:
            account_id = fee_debit_or_credit["account_id"]
            # if fee_cashflow is positive, it is a credit, if fee_cashflow is negative, it is a debit
            amount = fee_debit_or_credit["fee_cashflow"]
            self._update_account_collateral(account_id=account_id, amount=amount)

    def cashflow_propagation(self, account_id, amount):
        self._update_account_collateral(account_id=account_id, amount=amount)

    def propagate_liquidator_reward(self, liquidated_account_id, liquidator_account_id, liquidator_reward_amount):
        self._update_account_collateral(
            account_id=liquidated_account_id,
            amount=-liquidator_reward_amount,
        )

        self._update_account_collateral(
            account_id=liquidator_account_id,
            amount=liquidator_reward_amount,
        )

    def deposit_collateral(self, account_id, amount):

        if amount < 0:
            raise Exception("margin engine: amount deposited is negative")

        self._update_account_collateral(account_id=account_id, amount=amount)

    def withdraw_collateral(self, account_id, amount):

        if amount < 0:
            raise Exception("margin engine: amount withdrawn is negative")

        self._update_account_collateral(account_id=account_id, amount=-amount)

        is_IM_satisfied = self.get_liquidation_module().is_IM_satisfied(account_id=account_id)

        if not is_IM_satisfied:
            raise Exception("Withdrawal is not possible due to IM not satisfied")

    def get_total_account_value(self, account_id):

        account_unrealized_pnl = self.account_manager.get_account(
            account_id=account_id
        ).get_account_unrealized_pnl()

        account_discounted_collateral_value = self.get_account_collateral_balance(account_id=account_id)

        return account_unrealized_pnl + account_discounted_collateral_value

    def set_account_manager(self, account_manager):
        self.account_manager = account_manager

    def get_account_manager(self):
        if self.account_manager is None:
            raise Exception("collateral engine: account manager not set")

        return self.account_manager

    def set_price_oracle(self, price_oracle):
        self.price_oracle = price_oracle

    def get_price_oracle(self):
        if self.price_oracle is None:
            raise Exception("collateral engine: price oracle not set")

        return self.price_oracle

    def set_liquidation_module(self, liquidation_module):
        self.liquidation_module = liquidation_module

    def get_liquidation_module(self):
        if self.liquidation_module is None:
            raise Exception("collateral engine: liquidation engine not set")

        return self.liquidation_module