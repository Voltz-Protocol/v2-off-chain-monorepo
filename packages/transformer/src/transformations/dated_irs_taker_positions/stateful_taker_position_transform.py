import apache_beam as beam
from apache_beam.transforms.userstate import BagStateSpec
from apache_beam.coders import BigIntegerCoder, StrUtf8Coder, TimestampCoder
from apache_beam.coders import TupleCoder
from apache_beam.transforms.window import TimestampedValue

class StatefulTakerPositionTransformDoFn(beam.DoFn):

    '''
    - position table schema
        chain_id, instrument_id, market_id, maturity_timestamp, account_id, realized_pnl_from_swaps, realized_pnl_from_fees_paid, net_notional_locked,
        net_fixed_rate_locked, timestamp, rateOracleIndex, cashflow_li_factor, cashflow_time_factor, cashflow_free_term
    - need some notion of position_id which is a potentially a hash of chain_id, market_id, instrument_id, maturity_timestamp & account_id
    - need to get this from the initiate taker order event:
        timestamp, accountId, maturityId, maturityTimestamp, executedBaseAmount, executedQuoteAmount, rateOracleIndex, feesPaid
    - should be parallelised for each position_id
    '''

    TAKER_POSITION_STATE = BagStateSpec('taker_position', TupleCoder((BigIntegerCoder(), BigIntegerCoder(), BigIntegerCoder())))

    def process(self, initiateTakerOrderEventAndKey: tuple[str, dict], cached_taker_position_state=beam.DoFn.StateParam(TAKER_POSITION_STATE)):

        initiateTakerOrderEvent = initiateTakerOrderEventAndKey[1]
        fees_paid_to_initiate_taker_order = initiateTakerOrderEvent['fees_paid']
        executed_base_amount = initiateTakerOrderEvent['executed_base_amount']
        current_taker_order_event_timestamp = initiateTakerOrderEvent['timestamp']
        position_id = initiateTakerOrderEvent['position_id']

        cached_taker_position_state_list = [x for x in cached_taker_position_state.read()]

        current_realized_pnl_from_fees_paid = -fees_paid_to_initiate_taker_order
        current_net_notional_locked = executed_base_amount
        if len(cached_taker_position_state_list)>0:
            last_realized_pnl_from_fees_paid = cached_taker_position_state_list[0]
            last_net_notional_locked = cached_taker_position_state_list[1]
            cached_taker_position_state.clear()
            current_realized_pnl_from_fees_paid -= last_realized_pnl_from_fees_paid
            current_net_notional_locked += last_net_notional_locked
            # todo: executed_base_amount needs to be in turn transformed into the appropriate format
            # this could be done within another do function to keep individual transformations light

        cached_taker_position_state.add((current_realized_pnl_from_fees_paid, current_net_notional_locked))
        yield position_id, current_taker_order_event_timestamp, current_realized_pnl_from_fees_paid, current_net_notional_locked