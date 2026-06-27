import React from 'react';
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col gradient-elegant-light dark:gradient-elegant-dark">
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12">

        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">{APP_NAME}</span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Last updated: June 2026</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-xl p-5 sm:p-8 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how {APP_NAME} collects, uses, and protects your personal information when you use our application.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following types of information when you use {APP_NAME}:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-gray-700 dark:text-gray-300">Account information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Profile data:</strong> Age, height, weight, and fitness goals you provide.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Workout data:</strong> Exercise logs, sets, reps, durations, and workout history you record.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Body metrics:</strong> Weight entries and progress measurements you track over time.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Schedule data:</strong> Workout schedules and plans you create within the app.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Usage data:</strong> Pages visited, features used, and interaction patterns within the app.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your information solely to provide and improve the {APP_NAME} service:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create and manage your account.</li>
              <li>To display your workout history, progress, and statistics.</li>
              <li>To personalise your experience based on your goals and preferences.</li>
              <li>To save your settings and preferences across sessions.</li>
              <li>To improve app performance and fix issues.</li>
            </ul>
            <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </Section>

          <Section title="3. Data Storage and Security">
            <p>Your data is stored securely using Google Firebase, a cloud platform that employs industry-standard security measures including encryption in transit and at rest. We take reasonable technical and organisational measures to protect your information from unauthorised access, loss, or misuse.</p>
            <p>However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>FITNESS TRACKER uses the following third-party services to operate:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-gray-700 dark:text-gray-300">Google Firebase:</strong> Authentication, database storage, and app hosting.</li>
            </ul>
            <p>These services may collect limited technical information (such as IP addresses and device identifiers) as part of their standard operation.</p>
          </Section>

          <Section title="5. Your Rights">
            <p>You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-gray-700 dark:text-gray-300">Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Correction:</strong> Update or correct inaccurate information via your profile settings.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Deletion:</strong> Request deletion of your account and all associated data.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Portability:</strong> Request an export of your workout and health data.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>{APP_NAME} is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Continued use of the app after changes constitutes your acceptance of the updated policy.</p>
          </Section>

          <Section title="9. Contact">
            <p>If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:support@fitnesstracker.app" className="text-blue-600 dark:text-blue-400 hover:underline">support@fitnesstracker.app</a>.</p>
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