"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleGoogleCallback } from "@/api/authApi";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const callback = async () => {
        try {
          await handleGoogleCallback(token);
          router.replace("/dashboard");  
        } catch (error) {
          console.error("Google auth failed:", error);
          router.replace("/signin");
        }
      };

      callback();
    }
  }, []);

  return <></>;
}
