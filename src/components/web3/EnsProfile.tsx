"use client";

import { useAccount, useEnsName, useEnsAvatar } from "wagmi";
import { mainnet } from "wagmi/chains";

export const EnsProfile = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ 
      address, 
      chainId: mainnet.id // ENS is on Mainnet
  });
  const { data: ensAvatar } = useEnsAvatar({ 
      name: ensName!, 
      chainId: mainnet.id 
  });

  if (!address) return null;

  return (
    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
      {ensAvatar ? (
        <img src={ensAvatar} alt="ENS Avatar" className="w-8 h-8 rounded-full" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-pink)]" />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white tracking-wide">
          {ensName || `${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
        </span>
        {ensName && (
           <span className="text-[10px] text-gray-400 font-mono">
             Verified
           </span>
        )}
      </div>
    </div>
  );
};
