from risk_engine.src.constants import YEAR_IN_SECONDS
from risk_engine.src.contracts.exchanges.vamm.baseVAMMExchange import BaseVAMMExchange


class DatedIRSVAMMExchange(BaseVAMMExchange):
    def __init__(
        self,
        pool_id,
        block,
        min_tick,
        max_tick,
        tick_spacing,
        term_end_in_seconds,
        oracle,
        gwap_lookback=0,
    ):
        self.oracle = oracle

        super().__init__(
            pool_id=pool_id,
            block=block,
            min_tick=min_tick,
            max_tick=max_tick,
            tick_spacing=tick_spacing,
            term_end_in_seconds=term_end_in_seconds,
            gwap_lookback=gwap_lookback,
        )

    def _track_variable_tokens(self, base):
        return base

    def _track_fixed_tokens(self, base, tick_lower, tick_upper):
        avg_price = (
            self.price_at_tick(tick_lower) + self.price_at_tick(tick_upper)
        ) / 2
        time_delta = (self.term_end_in_seconds - self.block.timestamp) / YEAR_IN_SECONDS
        return -base * self.oracle.latest() * (avg_price * time_delta + 1)

    def price_at_tick(self, tick):
        return tick / 100000

    def tick_at_price(self, price):
        return self.closest_tick(price * 100000)
