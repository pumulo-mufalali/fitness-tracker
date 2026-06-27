﻿import React from 'react';
import Footer from '../components/Footer';
import { APP_NAME } from '../lib/constants';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mt-10 mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col gradient-elegant-light dark:gradient-elegant-dark">
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12">

        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">{APP_NAME}</span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Last updated: June 2026</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-xl p-5 sm:p-8 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Please read these Terms of Service carefully before using {APP_NAME}. By creating an account or using the app, you agree to be bound by these terms.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using {APP_NAME}, you confirm that you are at least 13 years of age and agree to these Terms of Service and our <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>. If you do not agree with any part of these terms, you may not use the service.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>{APP_NAME} is a personal fitness and health tracking application that allows users to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Log and track workout sessions and exercise history.</li>
              <li>Monitor body metrics such as weight over time.</li>
              <li>Set and track personal fitness goals.</li>
              <li>Create and manage workout schedules.</li>
              <li>View progress statistics and achievements.</li>
            </ul>
            <p>We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.</p>
          </Section>

          <Section title="3. User Accounts">
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate and complete information when creating your account.</li>
              <li>Keep your password secure and not share it with others.</li>
              <li>Notify us immediately of any unauthorised use of your account.</li>
              <li>Not create multiple accounts to circumvent restrictions.</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree to use {APP_NAME} only for its intended purpose and in compliance with applicable laws. You must not:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the service for any unlawful or fraudulent purpose.</li>
              <li>Attempt to gain unauthorised access to other users' accounts or data.</li>
              <li>Reverse engineer, decompile, or tamper with the application.</li>
              <li>Use automated tools (bots, scrapers) to interact with the service.</li>
              <li>Upload or transmit any malicious code or harmful content.</li>
            </ul>
          </Section>

          <Section title="5. Health and Fitness Disclaimer">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4 text-amber-800 dark:text-amber-300">
              <strong>Important:</strong> {APP_NAME} is a personal tracking tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before beginning any new exercise programme, especially if you have a pre-existing medical condition or injury.
            </div>
            <p>The information, goals, and statistics provided by the app are for informational purposes only. We are not liable for any injury, illness, or health outcome resulting from use of the app or reliance on its data.</p>
          </Section>

          <Section title="6. Your Data">
            <p>You retain ownership of all personal data and content you enter into {APP_NAME}. By using the service, you grant us a limited licence to store and process your data solely for the purpose of providing the service. For full details, see our <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>All content, design, code, and branding within {APP_NAME} (excluding user-generated data) is owned by {APP_NAME} and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the service without prior written permission.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>To the fullest extent permitted by law, {APP_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service, including but not limited to loss of data, personal injury, or health-related outcomes.</p>
            <p>The service is provided "as is" without warranties of any kind, either express or implied.</p>
          </Section>

          <Section title="9. Termination">
            <p>You may delete your account at any time through the app settings. We reserve the right to suspend or terminate your access to the service at our discretion if you violate these terms, with or without prior notice.</p>
            <p>Upon termination, your data will be deleted in accordance with our Privacy Policy.</p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>We may update these Terms of Service from time to time. We will notify you of material changes by updating the date at the top of this page. Your continued use of the app after changes are posted constitutes your acceptance of the new terms.</p>
          </Section>

          <Section title="11. Governing Law">
            <p>These Terms of Service are governed by and construed in accordance with applicable law. Any disputes arising from these terms shall be resolved through good-faith negotiation before pursuing formal legal proceedings.</p>
          </Section>

          <Section title="12. Contact">
            <p>If you have any questions about these Terms of Service, please contact us at <a href="mailto:support@fitnesstracker.app" className="text-blue-600 dark:text-blue-400 hover:underline">support@fitnesstracker.app</a>.</p>
          </Section>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => window.close()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            ← Back to {APP_NAME}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}