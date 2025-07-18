import { useEffect, useState } from "react";
import { fetchEmployerAvatar } from "../../context/UserContext"; // Adjust the import path if necessary
import { AvatarImage } from "../ui/avatar";

const AvatarWithFetch = ({ address }: { address: string }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(`https://effigy.im/a/${address}.svg`);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const url = await fetchEmployerAvatar(address);
        setAvatarUrl(url);
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    fetchAvatar();
  }, [address]);

  return <AvatarImage src={avatarUrl} alt={address} />;
};

export default AvatarWithFetch;