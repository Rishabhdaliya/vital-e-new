import { RegistrationForm } from "@/components/registration-form";

export default function Home() {
  return (
    <>
      <RegistrationForm
        heading={"Customer Registration Form"}
        className="w-sm mx-auto mt-20"
      />
    </>
  );
}
