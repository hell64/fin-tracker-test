import {
  UpdateAvatarCard,
  UpdateNameCard,
  UpdateUsernameCard,
  ChangeEmailCard,
  ChangePasswordCard,
  ProvidersCard,
  SessionsCard,
  DeleteAccountCard,
  UpdateFieldCard,
} from "@daveyplate/better-auth-ui";

export default function CustomSettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-12 px-4">
      <UpdateNameCard />

      <UpdateUsernameCard />

      <ChangePasswordCard />

      <SessionsCard />

      <DeleteAccountCard />

      {/* <UpdateFieldCard
        field="age"
        label="Age"
        description="Update your age"
        placeholder="Enter your current age"
        type="number"
      /> */}
    </div>
  );
}
