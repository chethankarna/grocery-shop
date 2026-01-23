// import './Account.css'

// function Account() {
//     const shopInfo = {
//         name: 'Much Shop',
//         phone: '919876543210', // Replace with actual number
//         whatsapp: '919876543210', // Same as phone or different
//         email: 'contact@muchshop.com',
//         address: '123 Main Street, Market Area, City - 500001',
//         hours: {
//             weekdays: '8:00 AM - 9:00 PM',
//             weekends: '8:00 AM - 10:00 PM'
//         }
//     }

//     const handleContactWhatsApp = () => {
//         const message = 'Hi Much Shop, I have a query about your products and services.'
//         const url = `https://wa.me/${shopInfo.whatsapp}?text=${encodeURIComponent(message)}`
//         openWhatsApp(url)
//     }

//     return (
//         <div className="min-h-screen bg-white pb-6">
//             <div className="max-w-3xl mx-auto px-4 py-6">
//                 {/* Header */}
//                 <div className="text-center mb-8">
//                     <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
//                         <span className="text-white font-bold text-3xl">F</span>
//                     </div>
//                     <h1 className="text-2xl font-bold text-text-primary mb-2">
//                         {shopInfo.name}
//                     </h1>
//                     <p className="text-text-secondary">
//                         Your trusted grocery partner
//                     </p>
//                 </div>

//                 {/* Contact Information */}
//                 <section className="mb-6">
//                     <h2 className="text-xl font-bold text-text-primary mb-4">
//                         Contact Us
//                     </h2>

//                     <div className="space-y-4">
//                         {/* WhatsApp */}
//                         <button
//                             onClick={handleContactWhatsApp}
//                             className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3"
//                             style={{ minHeight: '52px' }}
//                         >
//                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
//                             </svg>
//                             <span>Chat on WhatsApp</span>
//                         </button>

//                         {/* Phone */}
//                         <div className="bg-neutral-50 rounded-lg p-4 flex items-center">
//                             <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                             </svg>
//                             <div>
//                                 <div className="text-sm text-text-secondary">Phone</div>
//                                 <a href={`tel:+${shopInfo.phone}`} className="font-semibold text-text-primary hover:text-primary">
//                                     +{shopInfo.phone.replace(/(\d{2})(\d{10})/, '$1 $2')}
//                                 </a>
//                             </div>
//                         </div>

//                         {/* Email */}
//                         <div className="bg-neutral-50 rounded-lg p-4 flex items-center">
//                             <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                             </svg>
//                             <div>
//                                 <div className="text-sm text-text-secondary">Email</div>
//                                 <a href={`mailto:${shopInfo.email}`} className="font-semibold text-text-primary hover:text-primary">
//                                     {shopInfo.email}
//                                 </a>
//                             </div>
//                         </div>

//                         {/* Address */}
//                         <div className="bg-neutral-50 rounded-lg p-4 flex items-start">
//                             <svg className="w-6 h-6 text-primary mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                             </svg>
//                             <div>
//                                 <div className="text-sm text-text-secondary mb-1">Address</div>
//                                 <p className="font-medium text-text-primary">
//                                     {shopInfo.address}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Business Hours */}
//                 <section className="mb-6">
//                     <h2 className="text-xl font-bold text-text-primary mb-4">
//                         Business Hours
//                     </h2>
//                     <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
//                         <div className="flex justify-between">
//                             <span className="text-text-secondary">Monday - Friday</span>
//                             <span className="font-semibold text-text-primary">{shopInfo.hours.weekdays}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span className="text-text-secondary">Saturday - Sunday</span>
//                             <span className="font-semibold text-text-primary">{shopInfo.hours.weekends}</span>
//                         </div>
//                     </div>
//                 </section>

//                 {/* About */}
//                 <section>
//                     <h2 className="text-xl font-bold text-text-primary mb-4">
//                         About Us
//                     </h2>
//                     <div className="bg-neutral-50 rounded-lg p-6">
//                         <p className="text-text-secondary leading-relaxed mb-4">
//                             Much Shop is your trusted neighborhood grocery store, committed to bringing you the freshest fruits, vegetables, and daily essentials right to your doorstep.
//                         </p>
//                         <p className="text-text-secondary leading-relaxed">
//                             We source directly from local farms and trusted suppliers to ensure you get the best quality products at competitive prices. Order through our easy-to-use app and receive your groceries fresh and on time!
//                         </p>
//                     </div>
//                 </section>

//                 {/* App Version */}
//                 <div className="text-center mt-8 text-sm text-text-secondary">
//                     <p>Much Shop PWA v1.0.0</p>
//                     <p className="mt-1">Made with ❤️ for fresh food lovers</p>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Account



import './Account.css'
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Account() {

    const { user, signout, isAdmin } = useAuth()

    const shopInfo = {
        name: 'Much Shop',
        phone: '919876543210',
        whatsapp: '919876543210',
        email: 'contact@muchshop.com',
        address: '123 Main Street, Market Area, City - 500001',
        hours: {
            weekdays: '8:00 AM - 9:00 PM',
            weekends: '8:00 AM - 10:00 PM'
        }
    }

    const handleContactWhatsApp = () => {
        const message = 'Hi Much Shop, I have a query about your products and services.'
        const url = `https://wa.me/${shopInfo.whatsapp}?text=${encodeURIComponent(message)}`
        window.open(url, "_blank")
    }

    return (
        <div className="min-h-screen bg-white pb-6">
            <div className="max-w-3xl mx-auto px-4 py-6">

                {/* ================= AUTH SECTION ================= */}

                <section className="mb-8 bg-neutral-50 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4">
                        My Account
                    </h2>

                    {/* NOT LOGGED IN */}
                    {!user && (
                        <div className="space-y-3">
                            <p className="text-text-secondary">
                                You are not logged in
                            </p>

                            <div className="flex space-x-4">
                                <Link to="/login">
                                    <button className="bg-primary text-white px-6 py-2 rounded-lg">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/signup">
                                    <button className="border border-primary text-primary px-6 py-2 rounded-lg">
                                        Signup
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* LOGGED IN */}
                    {user && (
                        <div className="space-y-3">
                            <p className="text-text-secondary">
                                Logged in as:{" "}
                                <span className="font-semibold text-text-primary">
                                    {user.isAnonymous ? "Guest User" : user.email}
                                </span>
                            </p>

                            <div className="flex space-x-4">
                                <button
                                    onClick={signout}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg"
                                >
                                    Logout
                                </button>

                                {/* ADMIN BUTTON */}
                                {isAdmin && (
                                    <Link to="/admin">
                                        <button className="bg-black text-white px-6 py-2 rounded-lg">
                                            Admin Panel
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* ================= EXISTING SHOP INFO (UNCHANGED) ================= */}

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-3xl">M</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        {shopInfo.name}
                    </h1>
                    <p className="text-text-secondary">
                        Your trusted grocery partner
                    </p>
                </div>

                {/* Contact Information */}
                <section className="mb-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4">
                        Contact Us
                    </h2>

                    <div className="space-y-4">

                        {/* WhatsApp */}
                        <button
                            onClick={handleContactWhatsApp}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3"
                            style={{ minHeight: '52px' }}
                        >
                            <span>Chat on WhatsApp</span>
                        </button>

                        {/* Phone */}
                        <div className="bg-neutral-50 rounded-lg p-4 flex items-center">
                            <div>
                                <div className="text-sm text-text-secondary">Phone</div>
                                <a href={`tel:+${shopInfo.phone}`} className="font-semibold text-text-primary hover:text-primary">
                                    +{shopInfo.phone}
                                </a>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="bg-neutral-50 rounded-lg p-4 flex items-center">
                            <div>
                                <div className="text-sm text-text-secondary">Email</div>
                                <a href={`mailto:${shopInfo.email}`} className="font-semibold text-text-primary hover:text-primary">
                                    {shopInfo.email}
                                </a>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-neutral-50 rounded-lg p-4">
                            <div className="text-sm text-text-secondary mb-1">Address</div>
                            <p className="font-medium text-text-primary">
                                {shopInfo.address}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Business Hours */}
                <section className="mb-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4">
                        Business Hours
                    </h2>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Monday - Friday</span>
                            <span className="font-semibold text-text-primary">{shopInfo.hours.weekdays}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Saturday - Sunday</span>
                            <span className="font-semibold text-text-primary">{shopInfo.hours.weekends}</span>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section>
                    <h2 className="text-xl font-bold text-text-primary mb-4">
                        About Us
                    </h2>
                    <div className="bg-neutral-50 rounded-lg p-6">
                        <p className="text-text-secondary leading-relaxed mb-4">
                            Much Shop is your trusted neighborhood grocery store, committed to bringing you the freshest fruits, vegetables, and daily essentials right to your doorstep.
                        </p>
                        <p className="text-text-secondary leading-relaxed">
                            We source directly from local farms and trusted suppliers to ensure you get the best quality products at competitive prices.
                        </p>
                    </div>
                </section>

                {/* App Version */}
                <div className="text-center mt-8 text-sm text-text-secondary">
                    <p>Much Shop PWA v1.0.0</p>
                    <p className="mt-1">Made with ❤️ for fresh food lovers</p>
                </div>

            </div>
        </div>
    )
}

export default Account
