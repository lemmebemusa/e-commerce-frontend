import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Phone, Mail, MapPin, Clock, AlertCircle, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function About() {
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyData, employeesData] = await Promise.all([
          api.company.get(),
          api.employees.list(),
        ]);
        setCompany(companyData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner className="py-16" />;
  }

  const displayName = company?.name;
  const displayLogo = company?.logo_url;
  const displayDescription = company?.description;
  const displayAddress = company?.address;
  const displayPhone = company?.phone;
  const displayEmail = company?.email;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            {displayLogo && (
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden">
                <img src={displayLogo} alt={displayName || ''} className="w-full h-full object-contain" />
              </div>
            )}
            {displayName && <h1 className="text-4xl font-medium tracking-tight mb-4">{displayName}</h1>}
            {displayDescription && <p className="text-lg text-gray-500 leading-relaxed">{displayDescription}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {displayAddress && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Address</h3>
                    <p className="text-sm text-gray-500">{displayAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {displayPhone && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-sm text-gray-500">{displayPhone}</p>
                  </div>
                </div>
              </div>
            )}

            {displayEmail && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-sm text-gray-500">{displayEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {company?.opening_hours && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Opening Hours</h3>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{company.opening_hours}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {company?.emergency_contact && company?.emergency_phone && (
            <div className="bg-red-50 rounded-2xl p-6 mb-16">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-red-800">{company.emergency_contact}</h3>
                  <p className="text-sm text-red-600">
                    For urgent medical needs outside regular hours, call our emergency line:
                    <span className="font-medium ml-1">{company.emergency_phone}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-medium mb-8 text-center">Our Team</h2>
            {employees.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {employees.map(employee => (
                  <div key={employee.id} className="text-center">
                    <div className="bg-gray-50 rounded-2xl aspect-square mb-3 flex items-center justify-center overflow-hidden">
                      {employee.photo ? (
                        <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <h3 className="font-medium text-sm">{employee.name}</h3>
                    <p className="text-xs text-gray-500">{employee.role}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No team members added yet</p>
            )}
          </div>

          {company?.google_maps_embed_url && (
            <div className="mt-16">
              <h2 className="text-2xl font-medium mb-8 text-center">Find Us</h2>
              <div className="bg-gray-50 rounded-2xl aspect-video flex items-center justify-center overflow-hidden">
                <iframe
                  src={company.google_maps_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Company Location"
                  className="rounded-2xl"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}