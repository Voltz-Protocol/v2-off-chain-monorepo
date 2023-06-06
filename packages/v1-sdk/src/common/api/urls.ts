const baseUrl: string = 'https://api.voltz.xyz';

type Service =
  | 'chain-information'
  | 'all-pools'
  | 'position-pnl'
  | 'fixed-rates'
  | 'variable-rates'
  | 'portfolio-positions'
  | 'portfolio-position-details';

export const getServiceUrl = (service: Service): string => {
  return `${baseUrl}/${service}`;
};