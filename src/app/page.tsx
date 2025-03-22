"use client";

import { RegistrationForm } from "@/components/registration-form";
import { useGetUsersQuery } from "@/redux/features/users/usersApi";

export default function Home() {
  const { data, refetch: refetchUsers } = useGetUsersQuery(undefined);
  console.log(data);

  return <>Hello</>;
}
