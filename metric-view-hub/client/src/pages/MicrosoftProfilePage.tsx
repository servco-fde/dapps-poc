import { useEffect, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@databricks/appkit-ui/react';
import { RefreshCw, UserRound } from 'lucide-react';

interface MicrosoftProfile {
  displayName: string | null;
  email: string;
  jobTitle: string | null;
  department: string | null;
  employeeId: string | null;
  officeLocation: string | null;
}

type ProfileState =
  | { status: 'loading' }
  | { status: 'ready'; profile: MicrosoftProfile }
  | { status: 'error'; code: 'unauthorized' | 'unavailable' | 'no_match' | 'permission_denied' | 'connection_error' };

const errorCopy = {
  unauthorized: ['Signed-in identity unavailable', 'Sign in to the Databricks app and try again.'],
  unavailable: ['Microsoft profile unavailable', 'The connection is not configured for this environment.'],
  no_match: ['No matching Microsoft profile', 'Your Databricks email did not match a Microsoft account.'],
  permission_denied: [
    'Profile details need permission',
    'Your photo may appear here, but this app-only connection cannot read profile fields. The registration’s delegated User.Read permission requires a separate Microsoft user sign-in flow.',
  ],
  connection_error: ['Could not load your profile', 'Microsoft Graph did not return your profile. Try again.'],
} as const;

function displayValue(value: string | null): string {
  return value?.trim() || 'Not provided';
}

function initials(name: string | null): string {
  const letters = name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return letters || 'ME';
}

export function MicrosoftProfilePage() {
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/microsoft/profile', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (response.ok) {
          setState({ status: 'ready', profile: (await response.json()) as MicrosoftProfile });
          return;
        }
        const payload = (await response.json().catch(() => null)) as { code?: string } | null;
        const code = payload?.code;
        setState({
          status: 'error',
          code:
            code === 'unauthorized' || code === 'unavailable' || code === 'no_match' || code === 'permission_denied'
              ? code
              : 'connection_error',
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error', code: 'connection_error' });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  };

  return (
    <div className="servco-page mx-auto max-w-4xl space-y-6">
      <div>
        <div className="servco-eyebrow">Microsoft Entra</div>
        <h2 className="servco-page-title">My Microsoft profile</h2>
        <p className="mt-2 text-muted-foreground">Profile details from your organization’s Microsoft directory.</p>
      </div>

      {state.status === 'loading' && (
        <Card className="servco-section-card" aria-label="Loading Microsoft profile">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      )}

      {state.status === 'error' && state.code === 'permission_denied' && (
        <Card className="servco-section-card" role="alert">
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
            <Avatar className="size-20 shrink-0">
              <AvatarImage src="/api/microsoft/profile/photo" alt="Your Microsoft profile photo" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-base font-semibold">{errorCopy.permission_denied[0]}</h3>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {errorCopy.permission_denied[1]}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {state.status === 'error' && state.code !== 'permission_denied' && (
        <Alert variant={state.code === 'connection_error' ? 'destructive' : 'default'}>
          <UserRound className="h-4 w-4" />
          <AlertTitle>{errorCopy[state.code][0]}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{errorCopy[state.code][1]}</span>
            {state.code === 'connection_error' && (
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {state.status === 'ready' && (
        <Card className="servco-section-card">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src="/api/microsoft/profile/photo" alt="Your Microsoft profile photo" />
              <AvatarFallback>{initials(state.profile.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-xl">{displayValue(state.profile.displayName)}</CardTitle>
              <CardDescription className="break-all">{state.profile.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {(
                [
                  ['Job title', state.profile.jobTitle],
                  ['Department', state.profile.department],
                  ['Employee ID', state.profile.employeeId],
                  ['Office location', state.profile.officeLocation],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="border-t pt-3">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium">{displayValue(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
