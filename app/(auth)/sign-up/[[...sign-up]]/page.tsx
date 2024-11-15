import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          // Apply glass card styling using standard Tailwind classes
          card: "bg-black bg-opacity-30 backdrop-filter backdrop-blur-md rounded-2xl border border-gray-600 p-8",

          // Style form elements
          formButtonPrimary:
            "bg-white bg-opacity-10 hover:bg-opacity-20 text-white border border-white border-opacity-30 transition-all duration-200",
          formFieldInput:
            "bg-white bg-opacity-10 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-50",
          socialButtonsBlockButton:
            "bg-white bg-opacity-10 hover:bg-opacity-20 text-white border border-white border-opacity-30 transition-all duration-200",

          // Style text elements
          headerTitle: "text-white text-2xl font-bold",
          headerSubtitle: "text-white text-opacity-80",
          footerActionLink: "text-white hover:text-opacity-80",
          dividerLine: "bg-white bg-opacity-30",
          dividerText: "text-white text-opacity-60",
        },
        layout: {
          socialButtonsVariant: "blockButton",
        },
      }}
    />
  );
}
