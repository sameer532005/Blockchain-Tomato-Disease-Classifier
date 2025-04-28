import Image from "next/image";
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import Dashboard from "./dashboard/page";

export default function Home() {
  return (
    <>
      <Dashboard />
    </>
  );
}
