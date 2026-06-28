import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPost";
import Admin from "@/pages/Admin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";
import Extension from "@/pages/Extension";
import { AppStoreReview, PlayStoreReview } from "@/pages/StoreReview";
import Support from "@/pages/Support";
import Download from "@/pages/Download";
import Verify from "@/pages/Verify";
import { CookieConsent } from "@/components/CookieConsent";
import CareersComingSoon, { DevelopersComingSoon, PressComingSoon } from "@/pages/ComingSoon";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/careers" component={CareersComingSoon} />
      <Route path="/press" component={PressComingSoon} />
      <Route path="/developers" component={DevelopersComingSoon} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route path="/extension" component={Extension} />
      <Route path="/app-store" component={AppStoreReview} />
      <Route path="/play-store" component={PlayStoreReview} />
      <Route path="/support" component={Support} />
      <Route path="/download" component={Download} />
      <Route path="/verify" component={Verify} />
      <Route path="/admin1855" component={Admin} />
      <Route path="/admin1855/" component={Admin} />
      <Route path="/admin">
        <Redirect to="/admin1855" replace />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <CookieConsent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
