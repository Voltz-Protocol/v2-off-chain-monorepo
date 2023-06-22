import { Button, Typography } from 'brokoli-ui';
import * as React from 'react';

import { ButtonBox, PageContentBox, ContentBox } from './editLp.styled';
import { WalletButton } from '../../components/WalletButton';
import { WalletContext } from '../../context/WalletContext';
import { editLp, EditLpArgs } from '../../../src';
import { TestState } from '../../components/TestState';

export const EditLpTest: React.FunctionComponent<{
  positionId: EditLpArgs['positionId'];
  notional: EditLpArgs['notional'];
  margin: EditLpArgs['margin'];
}> = ({ positionId, margin, notional }) => {
  const { isLoggedIn, signer } = React.useContext(WalletContext);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testError, setTestError] = React.useState('');
  const [testResult, setTestResult] = React.useState('');
  const test = async () => {
    if (!signer) {
      alert('Connect Wallet First');
      return;
    }
    setIsTesting(true);
    try {
      const result = await editLp({
        positionId,
        signer,
        notional,
        margin,
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
        <PageContentBox>
          <Typography
            colorToken="lavenderWeb"
            typographyToken="primaryHeader1Black"
          >
            services/editLp
          </Typography>
          <TestState
            loading={isTesting}
            error={testError}
            result={testResult}
          />
          <ButtonBox>
            <Button variant="primary" onClick={test}>
              Test
            </Button>
          </ButtonBox>
        </PageContentBox>
      ) : null}
    </ContentBox>
  );
};
