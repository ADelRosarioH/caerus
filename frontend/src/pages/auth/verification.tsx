"use client";

import { VerificationFlow, UpdateVerificationFlowBody } from "@ory/client";
import { CardTitle } from "@ory/themes";
import { AxiosError } from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Flow, ActionCard, CenterLink, MarginCard } from "@pkg/ory";
import ory from "@pkg/ory/sdk";

const Verification: NextPage = () => {
  const [flow, setFlow] = useState<VerificationFlow>();

  // Get ?flow=... from the URL
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = searchParams.get("flow");
  const returnTo = searchParams.get("return_to");

  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router || flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getVerificationFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data);
        })
        .catch((err: AxiosError) => {
          switch (err.response?.status) {
            case 410:
            // Status code 410 means the request has expired - so let's load a fresh flow!
            case 403:
              // Status code 403 implies some other issue (e.g. CSRF) - let's reload!
              return router.push("/auth/verification");
          }

          throw err;
        });
      return;
    }

    // Otherwise we initialize it
    ory
      .createBrowserVerificationFlow({
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data);
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 400:
            // Status code 400 implies the user is already signed in
            return router.push("/");
        }

        throw err;
      });
  }, [flowId, router, returnTo, flow]);

  const onSubmit = (values: UpdateVerificationFlowBody) => {
    // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
    // their data when they reload the page.

    router.push(`/auth/verification?flow=${flow?.id}`);

    return ory
      .updateVerificationFlow({
        flow: String(flow?.id),
        updateVerificationFlowBody: values,
      })
      .then(({ data }) => {
        // Form submission was successful, show the message to the user!
        setFlow(data);
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 400:
            // Status code 400 implies the form validation had an error
            setFlow(err.response?.data);
            return;
          case 410:
            const newFlowID = err.response.data.use_flow_id;
            // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
            // their data when they reload the page.

            router.push(`/auth/verification?flow=${newFlowID}`);

            ory
              .getVerificationFlow({ id: newFlowID })
              .then(({ data }) => setFlow(data));
            return;
        }

        throw err;
      });
  };

  return (
    <>
      <Head>
        <title>Verify your account - Ory NextJS Integration Example</title>
        <meta name="description" content="NextJS + React + Vercel + Ory" />
      </Head>
      <MarginCard>
        <CardTitle>Verify your account</CardTitle>
        <Flow onSubmit={onSubmit} flow={flow} />
      </MarginCard>
      <ActionCard>
        <Link href="/" passHref>
          <CenterLink>Go back</CenterLink>
        </Link>
      </ActionCard>
    </>
  );
};

export default Verification;
