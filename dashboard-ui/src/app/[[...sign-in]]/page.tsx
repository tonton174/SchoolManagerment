"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn && user?.publicMetadata.role) {
      router.push(`/${user.publicMetadata.role}`);
    }
  }, [isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-lamaSky to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-400 border-solid rounded-full animate-spin bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-300"></div>
          <div className="text-lg text-gray-500 font-semibold animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    // Đã đăng nhập, đang redirect
    return null;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSky to-gray-50">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="w-full max-w-[420px] md:max-w-[480px] p-12 md:p-16 rounded-3xl shadow-2xl bg-white/90 flex flex-col gap-6 border border-gray-200 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-2 mb-2">
            <Image src="/logo.png" alt="" width={48} height={48} className="drop-shadow-xl" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Winki School</h1>
            <h2 className="text-lg text-gray-400 font-medium">Sign in to your account</h2>
          </div>
          <Clerk.GlobalError className="text-sm text-red-400 text-center" />
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm text-gray-600 font-semibold">Username</Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 text-lg bg-gray-50 transition-all duration-200"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm text-gray-600 font-semibold">Password</Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 text-lg bg-gray-50 transition-all duration-200"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <SignIn.Action
            submit
            className="bg-gradient-to-r from-black via-gray-800 to-gray-900 text-white font-semibold rounded-xl text-lg p-3 mt-2 shadow-lg hover:from-gray-900 hover:to-black transition-all duration-200 active:scale-95"
          >
            Sign In
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;