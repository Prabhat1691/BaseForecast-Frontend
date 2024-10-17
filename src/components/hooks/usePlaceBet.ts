import { enqueueSnackbar } from "notistack";
import { CONTRACT_ADDRESS, USDC_ADDRESS } from "../helpers/constants";
import {
  useAccount,
  useConnect,
  useContract,
  useContractWrite,
  useWaitForTransaction,
} from "@starknet-react/core";
import abi from "../../abi/ContractABI.json";
import tokenABI from "../../abi/ERC20ABI.json";
import { useEffect, useMemo, useState } from "react";
import useSwapTrade from "./useSwapTrade";

const usePlaceBet = (
  marketId: number,
  betAmount: string,
  choice: number,
  currentToken: string,
  amountUSDC?: any
) => {
  const { address } = useAccount();
  const { contract } = useContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
  });

  const { contract: tokenContract } = useContract({
    address: currentToken,
    abi: tokenABI,
  });

  const { contract: usdcContract } = useContract({
    address: USDC_ADDRESS,
    abi: tokenABI,
  });
  const [balance, setBalance] = useState("");
  const [decimals, setDecimals] = useState(0);

  const { swapCall } = useSwapTrade(currentToken, betAmount);

  const calls = useMemo(() => {
    if (
      !address ||
      !contract ||
      betAmount == "" ||
      !usdcContract ||
      decimals == 0
    )
      return [];
    return [
      usdcContract.populateTransaction["approve"]!(
        CONTRACT_ADDRESS,
        BigInt(parseFloat(betAmount) * 10 ** decimals)
      ),
      contract.populateTransaction["buy_shares"]!(
        marketId,
        choice,
        BigInt(parseFloat(betAmount) * 10 ** decimals)
      ),
    ];
  }, [contract, address, choice, betAmount, tokenContract]);

  const swapCalls = useMemo(() => {
    if (!address || !contract || !amountUSDC || !usdcContract) return [];

    const calls = swapCall?.concat([
      usdcContract.populateTransaction["approve"]!(
        CONTRACT_ADDRESS,
        amountUSDC
      ),
      contract.populateTransaction["buy_shares"]!(marketId, choice, amountUSDC),
    ]);

    return calls;
  }, [address, contract, choice, swapCall, amountUSDC, decimals, marketId]);

  const { writeAsync, data, isError } = useContractWrite({
    calls: currentToken === USDC_ADDRESS ? calls : swapCalls,
  });

  const getBalance = async () => {
    if (!tokenContract || !address) return;
    tokenContract.balance_of(address).then((res: any) => {
      tokenContract.decimals().then((resp: any) => {
        const balance = Number(res) / 10 ** Number(resp);
        setBalance(balance.toString());
        setDecimals(Number(resp));
      });
    });
  };

  useEffect(() => {
    getBalance();
  }, [tokenContract, address]);

  const { isPending: pending, isSuccess: success } = useWaitForTransaction({
    hash: data?.transaction_hash,
  });

  useEffect(() => {
    if (data && pending) {
      handleToast(
        "Transaction Pending",
        "Your transaction is being processed, please wait for a few seconds.",
        "info",
        data!.transaction_hash
      );
    }
    if (isError) {
      handleToast(
        "Oh shoot!",
        "Something unexpected happened, check everything from your side while we check what happened on our end and try again.",
        "info"
      );
    }
    if ((data && success) || (data && !pending)) {
      handleToast(
        "Prediction Placed Successfully!",
        "Watch out for the results in “My bets” section. PS - All the best for this and your next prediction.",
        "success",
        data!.transaction_hash
      );
      getBalance();
    }
  }, [data, isError, pending, success]);

  const handleToast = (
    message: string,
    subHeading: string,
    type: string,
    hash?: string
  ) => {
    enqueueSnackbar(message, {
      //@ts-ignore
      variant: "custom",
      subHeading: subHeading,
      hash: hash,
      type: type,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    });
  };

  return { balance, writeAsync, decimals };
};

export default usePlaceBet;
