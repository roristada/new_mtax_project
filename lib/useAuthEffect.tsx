import { useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

const useAuthEffect = (callback?: (authenticated: boolean) => void) => {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();

  const showErrorAndRedirect = useCallback(() => {
    Swal.fire({
      icon: "error",
      title: "Permission Denied",
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
      router.push("/login");
    }
    if (status === "authenticated" && session?.user) {
      const userID = session.user.id;
      const slug = params.slug as string;
      const isAdmin = session.user.role === "admin";

      if (String(userID) === String(slug) || isAdmin) {
        if (callback) callback(true);
      } else {
        showErrorAndRedirect();
        if (callback) callback(false);
      }
    }
  }, [status, session, params, router, callback, showErrorAndRedirect]);
};

export default useAuthEffect;

