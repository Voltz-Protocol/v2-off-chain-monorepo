import * as React from 'react';

import { ContentBox } from './updateMargin.styled';
import { WalletButton } from '../../components/WalletButton';
import { WalletContext } from '../../context/WalletContext';
import { updateMargin, UpdateMarginArgs } from '../../../src';
import { TestPage } from '../../components/TestPage/TestPage';

export const UpdateMarginTest: React.FunctionComponent<{
  positionId: UpdateMarginArgs['positionId'];
  margin: UpdateMarginArgs['margin'];
}> = ({ margin, positionId }) => {
  const { isLoggedIn, signer } = React.useContext(WalletContext);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testError, setTestError] = React.useState<null | unknown>(null);
  const [testResult, setTestResult] = React.useState('');
  const test = async () => {
    if (!signer) {
      alert('Connect Wallet First');
      return;
    }
    setIsTesting(true);
    setTestError(null);
    try {
      const result = await updateMargin({
        positionId,
        margin,
        signer,
      });
      setTestResult(JSON.stringify(result));
    } catch (error) {
      setTestError(error);
    } finally {
      setIsTesting(false);
    }
  };
  return (
    <ContentBox>
      <WalletButton />
      {isLoggedIn ? (
        <TestPage
          title="services/updateMargin"
          loading={isTesting}
          error={testError}
          result={testResult}
          onTestClick={test}
        />
      ) : null}
    </ContentBox>
  );
};
