import * as React from 'react';

import { ContentBox } from './approvePeriphery.styled';
import { WalletButton } from '../../../components/WalletButton';
import { WalletContext } from '../../../context/WalletContext';
import { approvePeriphery, ApprovePeripheryArgs } from '../../../../src';
import { TestPage } from '../../../components/TestPage/TestPage';

export const ApprovePeripheryTest: React.FunctionComponent<{
  ammId: ApprovePeripheryArgs['ammId'];
}> = ({ ammId }) => {
  const { isLoggedIn, signer } = React.useContext(WalletContext);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testError, setTestError] = React.useState<null | unknown>(null);
  const [testResult, setTestResult] = React.useState<any>('');
  const test = async () => {
    if (!signer) {
      alert('Connect Wallet First');
      return;
    }
    setIsTesting(true);
    setTestError(null);
    try {
      const result = await approvePeriphery({
        ammId,
        signer,
      });
      setTestResult(result);
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
          title="services/approvePeriphery"
          loading={isTesting}
          error={testError}
          result={testResult}
          onTestClick={test}
        />
      ) : null}
    </ContentBox>
  );
};
