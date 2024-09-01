import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

const useAuthEffect = (callback?: (authenticated: boolean) => void) => {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user) {
      const userID = session.user.id;
      const slug = params.slug as string;
      const isAdmin = session.user.role === "admin";

      if (String(userID) === String(slug) || isAdmin) {
        console.log('Access granted: User ID matches slug or user is admin');
        if (callback) callback(true);
      } else {
        console.log('Access denied: User ID does not match slug and user is not admin');
        showErrorAndRedirect();
        if (callback) callback(false);
      }
    }
  }, [status, session, params, router, callback]);

  const showErrorAndRedirect = () => {
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
  };
};

export default useAuthEffect;
