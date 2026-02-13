import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={styles.container}>
      <SignIn afterSignInUrl="/analyze" />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
};