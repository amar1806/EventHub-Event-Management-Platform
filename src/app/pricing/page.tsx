"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserRole } from "@/lib/types";

interface PricingTierProps {
  title: string;
  price: number;
  features: string[];
  recommended?: boolean;
  ctaLink: string;
  ctaText?: string;
}

const PricingTier = ({ 
  title, 
  price, 
  features, 
  recommended = false,
  ctaLink,
  ctaText = "Get Started"
}: PricingTierProps) => {
  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${recommended ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
      <div className={`p-6 ${recommended ? 'bg-blue-600 text-white' : 'bg-white'}`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold">₹{price}</span>
          <span className="ml-1 text-sm">/month</span>
        </div>
      </div>
      <div className="bg-white p-6">
        <ul className="space-y-4">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link 
            href={ctaLink} 
            className={`block w-full text-center px-4 py-2 rounded-md ${
              recommended 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      setRole(session?.user?.role || null);
    }
  }, [session, status]);

  // Define pricing tiers
  const freeTier: PricingTierProps = {
    title: "Free",
    price: 0,
    features: [
      "Create basic events",
      "Limited to 50 attendees",
      "Basic analytics",
      "Email support"
    ],
    ctaLink: role === UserRole.ATTENDEE ? "/dashboard/attendee" : "/auth/signup",
    ctaText: role === UserRole.ATTENDEE ? "Go to Dashboard" : "Sign Up Free"
  };

  const standardTier: PricingTierProps = {
    title: "Standard",
    price: 1999,
    features: [
      "Up to 500 attendees",
      "Advanced event customization",
      "Priority support",
      "Basic marketing tools",
      "Ticket categories"
    ],
    recommended: role === UserRole.ATTENDEE,
    ctaLink: role === UserRole.ORGANIZER ? "/dashboard/organizer" : "/auth/signup?plan=standard",
    ctaText: role === UserRole.ORGANIZER ? "Go to Dashboard" : "Get Started"
  };

  const proTier: PricingTierProps = {
    title: "Professional",
    price: 4999,
    features: [
      "Unlimited attendees",
      "Premium event customization",
      "24/7 phone support",
      "Advanced analytics & reporting",
      "White label options",
      "API access",
      "Dedicated account manager"
    ],
    recommended: role === UserRole.ORGANIZER,
    ctaLink: role === UserRole.ADMIN ? "/dashboard/admin" : "/auth/signup?plan=professional",
    ctaText: role === UserRole.ADMIN ? "Go to Dashboard" : "Contact Sales"
  };

  // Define role-specific pricing headings
  const getPricingHeading = () => {
    switch(role) {
      case UserRole.ATTENDEE:
        return "Upgrade Your Event Experience";
      case UserRole.ORGANIZER:
        return "Scale Your Event Management";
      case UserRole.ADMIN:
        return "Admin Platform Pricing";
      default:
        return "Choose the Right Plan for Your Events";
    }
  };

  // Define role-specific pricing subtexts
  const getPricingSubtext = () => {
    switch(role) {
      case UserRole.ATTENDEE:
        return "Unlock premium features and benefits for attending and managing your tickets.";
      case UserRole.ORGANIZER:
        return "Take your event organizing to the next level with our professional tools.";
      case UserRole.ADMIN:
        return "Complete platform access with administrative capabilities.";
      default:
        return "Simple, transparent pricing for everyone from casual event-goers to professional organizers.";
    }
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">{getPricingHeading()}</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">{getPricingSubtext()}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <PricingTier {...freeTier} />
          <PricingTier {...standardTier} />
          <PricingTier {...proTier} />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Need a custom solution?</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We offer custom enterprise solutions for large organizations. Contact our sales team for a personalized quote.
          </p>
          <div className="mt-8">
            <Link 
              href="/contact?subject=Enterprise%20Pricing" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        <div className="mt-20 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Frequently Asked Questions</h3>
            <div className="mt-5 border-t border-gray-200 pt-5">
              <dl className="space-y-8">
                <div>
                  <dt className="text-lg font-medium text-gray-900">How does the billing work?</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    All plans are billed monthly. You can upgrade or downgrade at any time, and your billing will be prorated accordingly.
                  </dd>
                </div>
                <div>
                  <dt className="text-lg font-medium text-gray-900">Can I cancel my subscription?</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your current billing cycle.
                  </dd>
                </div>
                <div>
                  <dt className="text-lg font-medium text-gray-900">What payment methods do you accept?</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    We accept all major credit cards, UPI payments, and wallet payments.
                  </dd>
                </div>
                <div>
                  <dt className="text-lg font-medium text-gray-900">Is there a free trial?</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    Yes, all paid plans include a 14-day free trial. No credit card required until you decide to continue.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 