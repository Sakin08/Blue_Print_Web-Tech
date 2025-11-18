import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import BuySell from './pages/BuySell.jsx';
import CreateBuySellPost from './pages/CreateBuySellPost.jsx';
import BuySellDetails from './pages/BuySellDetails.jsx';
import Housing from './pages/Housing.jsx';
import HousingDetails from './pages/HousingDetails.jsx';
import CreateHousingPost from './pages/CreateHousingPost.jsx';
import Events from './pages/Events.jsx';
import CreateEvent from './pages/CreateEvent.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Messages from './pages/Messages.jsx';
import Chat from './pages/Chat.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Calendar from './pages/Calendar.jsx';
import StudyGroups from './pages/StudyGroups.jsx';
import CreateStudyGroup from './pages/CreateStudyGroup.jsx';
import StudyGroupDetails from './pages/StudyGroupDetails.jsx';
import Jobs from './pages/Jobs.jsx';
import CreateJob from './pages/CreateJob.jsx';
import JobDetails from './pages/JobDetails.jsx';
import FoodMenu from './pages/FoodMenu.jsx';
import CreateFoodMenu from './pages/CreateFoodMenu.jsx';
import FoodMenuDetails from './pages/FoodMenuDetails.jsx';
import QuickMenuPost from './pages/QuickMenuPost.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetails from './pages/RestaurantDetails.jsx';
import CreateRestaurant from './pages/CreateRestaurant.jsx';
import MyRestaurant from './pages/MyRestaurant.jsx';
import MyRestaurants from './pages/MyRestaurants.jsx';
import AddMenuItem from './pages/AddMenuItem.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ContentManager from './pages/admin/ContentManager.jsx';
import HolidayCalendar from './pages/HolidayCalendar.jsx';
import BusSchedule from './pages/BusSchedule.jsx';
import LostFound from './pages/LostFound.jsx';
import CreateLostFound from './pages/CreateLostFound.jsx';
import LostFoundDetails from './pages/LostFoundDetails.jsx';
import BloodDonation from './pages/BloodDonation.jsx';
import RegisterDonor from './pages/RegisterDonor.jsx';
import Notifications from './pages/Notifications.jsx';
import CreateBloodRequest from './pages/CreateBloodRequest.jsx';
import BloodRequestDetails from './pages/BloodRequestDetails.jsx';
import EditDonorProfile from './pages/EditDonorProfile.jsx';
import Newsfeed from './pages/Newsfeed.jsx';
import SavedPosts from './pages/SavedPosts.jsx';
import PostDetail from './pages/PostDetail.jsx';
import About from './pages/About.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import Contact from './pages/Contact.jsx';
import Features from './pages/Features.jsx';
import FAQ from './pages/FAQ.jsx';
import HelpCenter from './pages/HelpCenter.jsx';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/messages' || location.pathname === '/feed';

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<ProtectedRoute><Newsfeed /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/buysell" element={<BuySell />} />
        <Route path="/buysell/create" element={<ProtectedRoute><CreateBuySellPost /></ProtectedRoute>} />
        <Route path="/buysell/:id" element={<BuySellDetails />} />
        <Route path="/housing" element={<Housing />} />
        <Route path="/housing/:id" element={<HousingDetails />} />
        <Route path="/housing/create" element={<ProtectedRoute><CreateHousingPost /></ProtectedRoute>} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/saved-posts" element={<ProtectedRoute><SavedPosts /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/study-groups" element={<StudyGroups />} />
        <Route path="/study-groups/create" element={<ProtectedRoute><CreateStudyGroup /></ProtectedRoute>} />
        <Route path="/study-groups/:id" element={<StudyGroupDetails />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/food-menu" element={<FoodMenu />} />
        <Route path="/food-menu/create" element={<ProtectedRoute><CreateFoodMenu /></ProtectedRoute>} />
        <Route path="/food-menu/:id" element={<FoodMenuDetails />} />
        <Route path="/quick-menu" element={<FoodMenu />} />
        <Route path="/quick-menu/post" element={<ProtectedRoute><QuickMenuPost /></ProtectedRoute>} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/create" element={<ProtectedRoute><CreateRestaurant /></ProtectedRoute>} />
        <Route path="/restaurants/:id" element={<RestaurantDetails />} />
        <Route path="/my-restaurants" element={<ProtectedRoute><MyRestaurants /></ProtectedRoute>} />
        <Route path="/my-restaurant/:id" element={<ProtectedRoute><MyRestaurant /></ProtectedRoute>} />
        <Route path="/my-restaurant/:restaurantId/add-item" element={<ProtectedRoute><AddMenuItem /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/content/:type" element={<ProtectedRoute><ContentManager /></ProtectedRoute>} />
        <Route path="/holidays" element={<HolidayCalendar />} />
        <Route path="/bus-schedule" element={<BusSchedule />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/lost-found/create" element={<ProtectedRoute><CreateLostFound /></ProtectedRoute>} />
        <Route path="/lost-found/:id" element={<LostFoundDetails />} />
        <Route path="/blood-donation" element={<BloodDonation />} />
        <Route path="/blood-donation/register" element={<ProtectedRoute><RegisterDonor /></ProtectedRoute>} />
        <Route path="/blood-donation/request" element={<ProtectedRoute><CreateBloodRequest /></ProtectedRoute>} />
        <Route path="/blood-donation/request/:id" element={<BloodRequestDetails />} />
        <Route path="/blood-donation/edit" element={<ProtectedRoute><EditDonorProfile /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/features" element={<Features />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;