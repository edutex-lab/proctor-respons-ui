import { useSearchParams, useNavigate } from "react-router";
import FullPageLoading from "../../../components/FullPageLoading";
import { useEffect } from "react";
import { useAuth } from "../../../auth/AuthProvider";

export default function SignInByToken(){

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
   

    useEffect(()=>{
        const handleSignInByToken = async () => {
            const token = searchParams.get('token');
            const redirect = searchParams.get('redirect');
            const lms = searchParams.get('lms');
            const lmsBackUrl = searchParams.get('back');
        

            if (!token || !lms || !redirect) {
                // No token or lms or redirect provided, redirect to sign-in page
                navigate('/sign-in');
                return;
            }

            try {
                // Attempt to sign in with the token
                await auth.signInByToken(token,lms || 'edunex');
                
                // Successful authentication, redirect user
                const redirectPath = redirect || '/';
                window.sessionStorage.setItem('lms-back-url',lmsBackUrl || 'https://edunex.itb.ac.id/exam');
                navigate(redirectPath, { replace: true });
            } catch (error) {
                console.error('Token authentication failed:', error);
                // Authentication failed, redirect to sign-in page
                navigate('/sign-in');
            }
        };

        handleSignInByToken();
    },[searchParams, navigate, auth])


    return <FullPageLoading/>;
}