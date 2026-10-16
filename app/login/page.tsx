import { Suspense } from 'react';
import LoginForm from '../components/common/form/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading sign in" />}>
      <LoginForm />
    </Suspense>
  );
}
