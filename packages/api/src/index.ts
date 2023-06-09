import { app } from './app';
import { getApiPort } from './services/envVars';

const main = async () => {
  const PORT = getApiPort();
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

main()
  .then(() => {
    console.log('Execution completed.');
  })
  .catch((error) => {
    console.log(`Error encountered. ${(error as unknown as Error).message}`);
  });
