'use client';

import { useState, useCallback } from 'react';
import { useUser } from '../layout/user.context';
import { Button } from '@gitroom/react/form/button';
import copy from 'copy-to-clipboard';
import { useToaster } from '@gitroom/react/toaster/toaster';

export const PublicComponent = () => {
  const user = useUser();
  const toaster = useToaster();
  const [reveal, setReveal] = useState(false);

  const copyToClipboard = useCallback(() => {
    toaster.show('API Key copied to clipboard', 'success');
    copy(user?.publicApi!);
  }, [user]);

  if (!user || !user.publicApi) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-[24px]">Public API</h2>
      <div className="text-customColor18 mt-[4px]">
        Use Postiz API to integrate with your tools.
        <br />
        <a
          className="underline hover:text-white"
          href="https://docs.postiz.com/public-api"
          target="_blank"
        >
          Read how to use it over the documentation.
        </a>
      </div>
      <div className="my-[16px] mt-[16px] bg-sixth border-fifth items-center border rounded-[4px] p-[24px] flex gap-[24px]">
        <div className="flex items-center">
          {reveal ? (
            user.publicApi
          ) : (
            <>
              <div className="blur-sm">{user.publicApi.slice(0, -5)}</div>
              <div>{user.publicApi.slice(-5)}</div>
            </>
          )}
        </div>
        <div>
          {!reveal ? (
            <Button onClick={() => setReveal(true)}>Reveal</Button>
          ) : (
            <Button onClick={copyToClipboard}>Copy Key</Button>
          )}
        </div>
      </div>
    </div>
  );
};
