import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { useLocale } from 'next-intl';

const useAuthEffect = (callback?: (authenticated: boolean) => void) => {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();

  const showErrorAndRedirect = useCallback(() => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "You don't have permission to access this page.",
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/");  
      }
    });
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/login`);
    }
    if (status === "authenticated" && session?.user) {
      
      const isAdmin = session.user.role === "admin";

      if (isAdmin) {
        console.log('Access granted: User is admin');
        if (callback) callback(true);
      } else {
        console.log('Access denied: User is not admin');
        showErrorAndRedirect();
        if (callback) callback(false);
      }
    }
  }, [status, session, router, callback, showErrorAndRedirect]);
};

export default useAuthEffect;

