import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={styles.container}>
      <SignUp afterSignUpUrl="/analyze" />
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
