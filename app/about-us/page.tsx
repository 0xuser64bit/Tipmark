"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  Globe,
  Wallet,
  Zap
} from "lucide-react";
import { signIn } from "next-auth/react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <LandingHeader />
      <main className="lg:w-3/5 mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-indigo-400">
            About DAOnation
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            Support your favorite creators directly with crypto. It's like "Buy
            Me a Coffee", but decentralized!
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-400">
                  {feature.icon}
                  <span className="ml-2">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-indigo-400">
            How It Works
          </h2>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900 text-indigo-200 font-bold mr-4">
                  {index + 1}
                </span>
                <span className="text-zinc-300">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-indigo-400">
            Ready to Support Creators?
          </h2>
          <p className="text-xl text-zinc-300 mb-8">
            Connect your wallet and start supporting your favorite creators with
            crypto!
          </p>
          <Button
            onClick={async () => {
              await signIn("google", {
                redirect: true,
                callbackUrl: "/edit-profile",
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

const features = [
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Direct Crypto Payments",
    description:
      "Send cryptocurrency directly to creators, no middlemen involved.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast & Low Fees",
    description:
      "Quick transactions with minimal fees, maximizing your support.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Reach",
    description:
      "Support creators from anywhere in the world, breaking down financial barriers.",
  },
];

const steps = [
  "Connect your cryptocurrency wallet to the DAOnation platform.",
  "Browse through creators or search for your favorites.",
  "Choose the amount of crypto you want to send.",
  "Confirm the transaction in your wallet.",
  "The creator receives your support directly and instantly!",
];
