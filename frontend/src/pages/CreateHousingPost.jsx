import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import housingApi from '../api/housing.js';
import { Home, MapPin, Calendar, Users, Wifi, Zap, Droplet, Car, Shield, Sofa, Wind, UserCheck, Flame } from 'lucide-react';

const FACILITIES = [
  { value: 'attached_bath', label: 'Attached Bath', icon: Droplet },
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'gas_line', label: 'Gas Line', icon: Flame },
  { value: 'gas_cylinder', label: 'Gas Cylinder', icon: Zap },
  { value: 'generator', label: 'Generator/IPS', icon: Zap },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'lift', label: 'Lift/Elevator', icon: Home },
  { value: 'security', label: 'Security Guard', icon: Shield },
  { value: 'house_maid', label: 'House Maid', icon: UserCheck },
  { value: 'furnished', label: 'Furnished', icon: Sofa },
  { value: 'balcony', label: 'Balcony', icon: Wind },
  { value: 'kitchen', label: 'Shared Kitchen', icon: Home }
];

const CreateHousingPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    postType: 'available',
    housingType: 'seat',
    title: '',
    location: '',
    address: '',
    rent: '',
    maxBudget: '', // For "looking" posts
    availableFrom: '',
    totalSeats: '',
    availableSeats: '',
    totalRooms: '',
    genderPreference: 'any',
    preferredTenant: 'student',
    facilities: [],
    floorNumber: '',
    distanceFromCampus: '',
    advanceDeposit: '',
    negotiable: false,
    utilitiesIncluded: false,
    description: '',
    phone: user?.phone || '',
    preferredContact: 'both'
  });

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'facilities') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(image => {
        data.append('images', image);
      });

      await housingApi.create(data);
      navigate('/housing');
    } catch (err) {
      alert('Failed to create listing: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Home className="w-8 h-8 text-indigo-600" />
            Create Housing Post
          </h1>
          <p className="text-gray-600 mb-6">Post your housing availability or search request</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type & Housing Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Post Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, postType: 'available' }))}
                    className={`p-4 rounded-lg border-2 transition ${formData.postType === 'available'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold">Available</div>
                    <div className="text-xs text-gray-600">I have housing</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, postType: 'looking' }))}
                    className={`p-4 rounded-lg border-2 transition ${formData.postType === 'looking'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold">Looking For</div>
                    <div className="text-xs text-gray-600">I need housing</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Housing Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['seat', 'room', 'flat'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, housingType: type }))}
                      className={`p-3 rounded-lg border-2 transition capitalize ${formData.housingType === type
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., 2 Seats Available in Kumargaon"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Location - Text Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Area/Location Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Kumargaon, Shahjalal Upashahar, Modhuban"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the area name near SUST campus</p>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="House/Building name, Road, Area"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Budget/Rent & Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formData.postType === 'available' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {/* <DollarSign className="w-4 h-4 inline mr-1" /> */}
                    Rent (BDT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    required
                    placeholder="5000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {/* <DollarSign className="w-4 h-4 inline mr-1" /> */}
                    Max Budget (BDT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxBudget"
                    value={formData.maxBudget}
                    onChange={handleChange}
                    required
                    placeholder="6000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum you can afford</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {formData.postType === 'available' ? 'Available From' : 'Need By'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {formData.postType === 'available' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Advance Deposit (BDT)
                  </label>
                  <input
                    type="number"
                    name="advanceDeposit"
                    value={formData.advanceDeposit}
                    onChange={handleChange}
                    placeholder="10000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Capacity */}
            {formData.housingType !== 'flat' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Total {formData.housingType === 'seat' ? 'Seats' : 'Rooms'}
                  </label>
                  <input
                    type="number"
                    name={formData.housingType === 'seat' ? 'totalSeats' : 'totalRooms'}
                    value={formData.housingType === 'seat' ? formData.totalSeats : formData.totalRooms}
                    onChange={handleChange}
                    placeholder="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {formData.postType === 'available' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Available {formData.housingType === 'seat' ? 'Seats' : 'Rooms'}
                    </label>
                    <input
                      type="number"
                      name="availableSeats"
                      value={formData.availableSeats}
                      onChange={handleChange}
                      placeholder="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}

            {formData.housingType === 'flat' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Rooms
                </label>
                <input
                  type="number"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleChange}
                  placeholder="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender Preference
                </label>
                <select
                  name="genderPreference"
                  value={formData.genderPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="any">Any</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Tenant
                </label>
                <select
                  name="preferredTenant"
                  value={formData.preferredTenant}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="family">Family</option>
                  <option value="any">Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Floor Number
                </label>
                <input
                  type="text"
                  name="floorNumber"
                  value={formData.floorNumber}
                  onChange={handleChange}
                  placeholder="e.g., 3rd Floor"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Facilities - Only for Available posts */}
            {formData.postType === 'available' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Facilities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {FACILITIES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleFacilityToggle(value)}
                      className={`p-3 rounded-lg border-2 transition text-sm ${formData.facilities.includes(value)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs">{label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desired Facilities - Only for Looking posts */}
            {formData.postType === 'looking' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Desired Facilities (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {FACILITIES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleFacilityToggle(value)}
                      className={`p-3 rounded-lg border-2 transition text-sm ${formData.facilities.includes(value)
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs">{label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select facilities you're looking for</p>
              </div>
            )}

            {/* Checkboxes - Only for Available posts */}
            {formData.postType === 'available' && (
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Rent is Negotiable</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="utilitiesIncluded"
                    checked={formData.utilitiesIncluded}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Utilities Included in Rent</span>
                </label>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.postType === 'available' ? 'Description' : 'Requirements & Preferences'} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder={
                  formData.postType === 'available'
                    ? "Describe the housing, nearby facilities, rules, etc."
                    : "Describe what you're looking for, your requirements, preferred area, etc."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="01XXXXXXXXX"
                  pattern="[0-9]{11}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <select
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="both">Phone & Message</option>
                  <option value="phone">Phone Call Only</option>
                  <option value="message">Message Only</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photos (Optional but recommended)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload up to 5 photos. Posts with photos get more responses!
              </p>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create Housing Post'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/housing')}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHousingPost;
