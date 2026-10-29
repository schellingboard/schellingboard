"use client";
import { useContext } from "react";
import { UserContext } from "../../context";
import { GuestLoginForm } from "../../guest-login-form";

export function LoginConfirm({
  guestId,
  guestName,
  code,
}: {
  guestId: string;
  guestName: string;
  code: string;
}) {
  const { applyUser } = useContext(UserContext);

  return (
    <GuestLoginForm
      guestId={guestId}
      guestName={guestName}
      initialCredential={code}
      onSuccess={() => {
        applyUser?.(guestId);
        window.location.assign("/");
      }}
    />
  );
}
