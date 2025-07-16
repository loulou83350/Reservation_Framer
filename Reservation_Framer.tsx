import React, { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"

/**
 * BOOKLA CALENDAR COMPONENT FOR FRAMER
 * ===================================
 *
 * This is a complete booking calendar component that integrates with Bookla API.
 * It supports dynamic services, configurable form fields, and full customization.
 *
 * Features:
 * - Dynamic services configuration (1-10 services)
 * - Configurable API credentials
 * - Dynamic form fields with show/hide and required/optional
 * - Full text customization
 * - Complete styling control
 * - Responsive layout with configurable spacing
 * - Client API priority with Merchant API fallback
 * - Configurable calendar cell padding
 * - Auto-hide service selection when only one service
 * - Multi-language support (months and weekdays)
 * - Flexible width that adapts to container
 * - Flexible APA price display options
 * - NEW: Week/Month view toggle with week navigation
 * - NEW: Customizable unavailable days color
 * - NEW: Optional legend display
 * - NEW: Multilingual price labels
 * - NEW: Custom booking success message
 * - NEW: Auto-adaptive height
 * - NEW: Clean cell display (no slot count)
 * - NEW: React Portals for guaranteed modal z-index
 *
 * Author: Created for Loupinedou Yacht
 * Version: 1.9 - React Portals for Modals
 */

/**
 * Multi-language support
 * Available languages with their months and weekdays
 */
const LANGUAGE_DATA = {
    french: {
        months: [
            "Janvier",
            "Février",
            "Mars",
            "Avril",
            "Mai",
            "Juin",
            "Juillet",
            "Août",
            "Septembre",
            "Octobre",
            "Novembre",
            "Décembre",
        ],
        weekdays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        today: "Aujourd'hui",
        priceLabel: "Prix",
        currentWeek: "Semaine actuelle",
        weekOf: "Semaine du",
        to: "au",
    },
    english: {
        months: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        today: "Today",
        priceLabel: "Price",
        currentWeek: "Current week",
        weekOf: "Week of",
        to: "to",
    },
    spanish: {
        months: [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ],
        weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        today: "Hoy",
        priceLabel: "Precio",
        currentWeek: "Semana actual",
        weekOf: "Semana del",
        to: "al",
    },
    german: {
        months: [
            "Januar",
            "Februar",
            "März",
            "April",
            "Mai",
            "Juni",
            "Juli",
            "August",
            "September",
            "Oktober",
            "November",
            "Dezember",
        ],
        weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
        today: "Heute",
        priceLabel: "Preis",
        currentWeek: "Aktuelle Woche",
        weekOf: "Woche vom",
        to: "bis",
    },
    italian: {
        months: [
            "Gennaio",
            "Febbraio",
            "Marzo",
            "Aprile",
            "Maggio",
            "Giugno",
            "Luglio",
            "Agosto",
            "Settembre",
            "Ottobre",
            "Novembre",
            "Dicembre",
        ],
        weekdays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
        today: "Oggi",
        priceLabel: "Prezzo",
        currentWeek: "Settimana corrente",
        weekOf: "Settimana del",
        to: "al",
    },
    portuguese: {
        months: [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ],
        weekdays: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
        today: "Hoje",
        priceLabel: "Preço",
        currentWeek: "Semana atual",
        weekOf: "Semana de",
        to: "a",
    },
    dutch: {
        months: [
            "Januari",
            "Februari",
            "Maart",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Augustus",
            "September",
            "Oktober",
            "November",
            "December",
        ],
        weekdays: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
        today: "Vandaag",
        priceLabel: "Prijs",
        currentWeek: "Huidige week",
        weekOf: "Week van",
        to: "tot",
    },
}

/**
 * Utility function to format date to ISO string without timezone issues
 */
function formatDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

/**
 * Utility function to format date for display in modals
 */
function formatDateForDisplay(dateString) {
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

/**
 * Utility function to format time string for display
 */
function formatTimeString(dateTimeString) {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
}

/**
 * Utility function to format date for week display (DD/MM)
 */
function formatDateForWeekDisplay(date) {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${day}/${month}`
}

/**
 * Utility function to check if a date is in the past
 */
function isDateInPast(date) {
    const today = new Date()
    const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    )
    const checkDateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    )
    return checkDateOnly < todayDateOnly
}

/**
 * Utility function to check if a date is today
 */
function isToday(date) {
    const today = new Date()
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    )
}

/**
 * Hook to detect mobile screens
 */
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    return isMobile
}

/**
 * Modal Portal Component - Renders modals outside of component hierarchy
 */
function ModalPortal({ children, isOpen }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        if (isOpen) {
            // Block scrolling when modal opens
            document.body.style.overflow = "hidden"
        } else {
            // Restore scrolling when modal closes
            document.body.style.overflow = ""
        }

        // Cleanup function
        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    // Render directly to document.body using createPortal
    return createPortal(children, document.body)
}

/**
 * Main Bookla Calendar Component
 */
export default function BooklaCalendarFramerComplete(props) {
    const {
        // API Configuration
        apiConfig = {
            organizationId: "OrganizationID",
            apiKey: "APIKey",
            baseUrl: "https://us.bookla.com",
            resourceId: "RessourceID",
        },

        // Language Configuration
        language = {
            calendar: "french",
            customMonths: [],
            customWeekdays: [],
            customTodayButton: "",
        },

        // Text Configuration
        texts = {
            title: "Réservation de Bateau",
            subtitle:
                "Sélectionnez une date disponible pour réserver votre service",
            serviceLabel: "Sélectionnez votre service :",
            todayButton: "Aujourd'hui",
            availableLabel: "Disponible",
            loadingText: "Chargement des disponibilités...",
            errorRetryButton: "Réessayer",
            chooseTimeTitle: "Choisissez un horaire",
            bookingTitle: "Réservation",
            bookingButton: "Réserver",
            bookingInProgress: "Réservation...",
            backButton: "Retour",
            cancelButton: "Annuler",
            closeButton: "Fermer",
            successTitle: "🎉 Réservation créée !",
            customSuccessMessage:
                "Merci pour la réservation, vous allez être redirigé vers la page de paiement",
            paymentRedirectText: "🚀 Redirection vers le paiement...",
            emailInstructionsText: "📧 Instructions envoyées par email",
            footerText: "Paiement sécurisé 100% géré par Bookla",
            showTitle: true,
            showSubtitle: true,
            showServiceLabel: true,
            showFooterText: true,
        },

        // URL Configuration
        urls = {
            successUrl: "https://loupinedou-yacht.fr/confirmation-page",
            cancelUrl: "https://loupinedou-yacht.fr/error-page",
            termsUrl: "https://loupinedou-yacht.fr/conditions",
            privacyUrl: "https://loupinedou-yacht.fr/privacy",
        },

        // Services Configuration
        servicesCount = 3,
        service1 = {
            enabled: true,
            id: "Service 1",
            name: "Service Journée",
            description: "Une journée complète de navigation",
            basePrice: 300,
            apaPrice: 100,
            duration: "8 heures",
        },
        service2 = {
            enabled: true,
            id: "Service 2",
            name: "Service Sunset",
            description: "Navigation au coucher du soleil",
            basePrice: 200,
            apaPrice: 50,
            duration: "4 heures",
        },
        service3 = {
            enabled: true,
            id: "Service 3",
            name: "Service Mix",
            description: "Formule personnalisée",
            basePrice: 350,
            apaPrice: 120,
            duration: "Sur mesure",
        },

        // Form Fields Configuration
        formFields = {
            firstName: {
                show: true,
                required: true,
                label: "Prénom",
                placeholder: "Votre prénom",
            },
            lastName: {
                show: true,
                required: true,
                label: "Nom",
                placeholder: "Votre nom",
            },
            email: {
                show: true,
                required: true,
                label: "Email",
                placeholder: "votre@email.com",
            },
            phone: {
                show: true,
                required: true,
                label: "Téléphone",
                placeholder: "0123456789",
            },
            address: {
                show: false,
                required: false,
                label: "Adresse",
                placeholder: "Votre adresse",
            },
            city: {
                show: false,
                required: false,
                label: "Ville",
                placeholder: "Votre ville",
            },
            zipCode: {
                show: false,
                required: false,
                label: "Code postal",
                placeholder: "12345",
            },
            company: {
                show: false,
                required: false,
                label: "Entreprise",
                placeholder: "Nom de votre entreprise",
            },
            comments: {
                show: false,
                required: false,
                label: "Commentaires",
                placeholder: "Vos commentaires...",
            },
        },

        // Checkbox Configuration
        checkboxes = {
            terms: {
                show: true,
                required: true,
                label: "J'accepte les conditions générales",
            },
            privacy: {
                show: false,
                required: false,
                label: "J'accepte la politique de confidentialité",
            },
            newsletter: {
                show: false,
                required: false,
                label: "Je souhaite recevoir la newsletter",
            },
        },

        // Theme Configuration
        theme = {
            primaryColor: "#16a34a",
            secondaryColor: "#f1f5f9",
            backgroundColor: "#ffffff",
            textColor: "#374151",
            borderColor: "#e2e8f0",
            unavailableColor: "#f1f5f9",
            fontFamily:
                "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 16,
            borderRadius: 12,
        },

        // Layout Configuration
        layout = {
            maxWidth: 800,
            containerPadding: 32,
            sectionSpacing: 32,
            elementSpacing: 16,
            calendarGap: 8,
            calendarCellPadding: 8,
            modalPadding: 32,
        },

        // Feature Configuration
        features = {
            showPrices: true,
            showDescriptions: true,
            showDuration: true,
            hideServiceSelectionWhenSingle: true,
            debugMode: false,
            showAPA: true,
            showPriceBreakdown: true,
            calendarView: "month",
            showLegend: false,
        },
    } = props

    // Hook for mobile detection
    const isMobile = useIsMobile()

    /**
     * RESPONSIVE CALCULATIONS
     */
    const getResponsiveValues = () => {
        // Ajustements responsifs pour mobile
        const mobileFontScale = isMobile ? 0.85 : 1
        const mobileSpacingScale = isMobile ? 0.7 : 1
        const mobilePaddingScale = isMobile ? 0.6 : 1

        return {
            fontSize: Math.round(theme.fontSize * mobileFontScale),
            containerPadding: Math.round(
                layout.containerPadding * mobileSpacingScale
            ),
            sectionSpacing: Math.round(
                layout.sectionSpacing * mobileSpacingScale
            ),
            elementSpacing: Math.round(
                layout.elementSpacing * mobileSpacingScale
            ),
            calendarGap: Math.max(
                2,
                Math.round(layout.calendarGap * mobileSpacingScale)
            ),
            calendarCellPadding: Math.max(
                2,
                Math.round(layout.calendarCellPadding * mobilePaddingScale)
            ),
            modalPadding: Math.round(layout.modalPadding * mobileSpacingScale),
        }
    }

    const responsive = getResponsiveValues()

    /**
     * PRICE DISPLAY LOGIC WITH MULTILINGUAL LABELS
     */
    const getPriceDisplay = (service) => {
        if (!features.showPrices) return null

        const priceLabel =
            LANGUAGE_DATA[language.calendar]?.priceLabel || "Price"
        const hasAPA = features.showAPA && service.apaPrice > 0
        const basePrice = service.basePrice
        const apaPrice = service.apaPrice
        const totalPrice = basePrice + apaPrice

        if (!hasAPA) {
            return { simple: `${basePrice}€`, total: `${basePrice}€` }
        }

        if (features.showPriceBreakdown) {
            return {
                breakdown: (
                    <>
                        <div>
                            <span>{priceLabel}: </span>
                            <span style={{ fontWeight: "600" }}>
                                {basePrice}€ + {apaPrice}€ APA
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: `${responsive.fontSize * 1.25}px`,
                                fontWeight: "700",
                                color: theme.primaryColor,
                                marginTop: "8px",
                            }}
                        >
                            Total: {totalPrice}€
                        </div>
                    </>
                ),
                total: `${totalPrice}€`,
            }
        }

        return { simple: `${totalPrice}€`, total: `${totalPrice}€` }
    }

    /**
     * LANGUAGE HANDLING LOGIC
     */
    const getLanguageData = () => {
        const MONTHS =
            language.customMonths && language.customMonths.length === 12
                ? language.customMonths
                : LANGUAGE_DATA[language.calendar]?.months ||
                  LANGUAGE_DATA.french.months

        const WEEKDAYS =
            language.customWeekdays && language.customWeekdays.length === 7
                ? language.customWeekdays
                : LANGUAGE_DATA[language.calendar]?.weekdays ||
                  LANGUAGE_DATA.french.weekdays

        const TODAY_BUTTON =
            language.customTodayButton ||
            LANGUAGE_DATA[language.calendar]?.today ||
            texts.todayButton ||
            "Today"

        const PRICE_LABEL =
            LANGUAGE_DATA[language.calendar]?.priceLabel || "Price"
        const CURRENT_WEEK =
            LANGUAGE_DATA[language.calendar]?.currentWeek || "Current week"
        const WEEK_OF = LANGUAGE_DATA[language.calendar]?.weekOf || "Week of"
        const TO = LANGUAGE_DATA[language.calendar]?.to || "to"

        return {
            MONTHS,
            WEEKDAYS,
            TODAY_BUTTON,
            PRICE_LABEL,
            CURRENT_WEEK,
            WEEK_OF,
            TO,
        }
    }

    const {
        MONTHS,
        WEEKDAYS,
        TODAY_BUTTON,
        PRICE_LABEL,
        CURRENT_WEEK,
        WEEK_OF,
        TO,
    } = getLanguageData()

    /**
     * SERVICES BUILDING LOGIC
     */
    const allServices = [service1, service2, service3]
    const activeServices = allServices
        .slice(0, servicesCount)
        .filter((service) => service && service.enabled)

    const shouldShowServiceSelection =
        !features.hideServiceSelectionWhenSingle || activeServices.length > 1

    // Component State Management
    const today = new Date()
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())

    // Week navigation state
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const todayDay = today.getDay()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(
            today.getDate() - (todayDay === 0 ? 6 : todayDay - 1)
        )
        startOfWeek.setHours(0, 0, 0, 0)
        return startOfWeek
    })

    const [selectedServiceId, setSelectedServiceId] = useState(
        activeServices[0]?.id || ""
    )
    const [availableSlots, setAvailableSlots] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Booking Flow State
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
    const [showTimeSelection, setShowTimeSelection] = useState(false)
    const [showBookingForm, setShowBookingForm] = useState(false)
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(null)

    // Customer Form Data
    const [customerInfo, setCustomerInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        company: "",
        comments: "",
        termsAccepted: false,
        privacyAccepted: false,
        newsletterAccepted: false,
    })

    /**
     * Debug logging function
     */
    const debugLog = useCallback(
        (message, data) => {
            if (features.debugMode) {
                console.log(`🔧 [Bookla Debug] ${message}`, data || "")
            }
        },
        [features.debugMode]
    )

    /**
     * Auto-select first service when services change
     */
    useEffect(() => {
        if (activeServices.length > 0 && !selectedServiceId) {
            setSelectedServiceId(activeServices[0].id)
            debugLog("Auto-selected first service", activeServices[0])
        }
    }, [activeServices, selectedServiceId, debugLog])

    /**
     * MAIN API CALL - Fetch availability from Bookla
     */
    useEffect(() => {
        if (!selectedServiceId || activeServices.length === 0) {
            debugLog(
                "Skipping availability fetch - no service selected or no active services"
            )
            return
        }

        const fetchAvailability = async () => {
            setLoading(true)
            setError(null)
            debugLog("Starting availability fetch")

            try {
                let startDate, endDate

                if (features.calendarView === "week") {
                    startDate = new Date(currentWeekStart)
                    endDate = new Date(currentWeekStart)
                    endDate.setDate(startDate.getDate() + 6)
                    endDate.setHours(23, 59, 59, 999)
                } else {
                    startDate = new Date(currentYear, currentMonth, 1)
                    endDate = new Date(
                        currentYear,
                        currentMonth + 1,
                        0,
                        23,
                        59,
                        59
                    )
                }

                const fromDate = startDate.toISOString()
                const toDate = endDate.toISOString()

                debugLog(`Date range: ${fromDate} → ${toDate}`)

                const apiUrl = `${apiConfig.baseUrl}/api/v1/companies/${apiConfig.organizationId}/services/${selectedServiceId}/times`

                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "X-API-Key": apiConfig.apiKey,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: fromDate,
                        to: toDate,
                        spots: 1,
                    }),
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(
                        `Bookla API Error: ${response.status} - ${errorText}`
                    )
                }

                const apiData = await response.json()
                debugLog("API Response:", apiData)

                const slotsGroupedByDate = {}

                if (apiData && apiData.times) {
                    Object.entries(apiData.times).forEach(
                        ([resourceId, resourceSlots]) => {
                            if (Array.isArray(resourceSlots)) {
                                resourceSlots.forEach((slot) => {
                                    if (slot.startTime) {
                                        const slotDate =
                                            slot.startTime.split("T")[0]
                                        if (!slotsGroupedByDate[slotDate]) {
                                            slotsGroupedByDate[slotDate] = []
                                        }
                                        slotsGroupedByDate[slotDate].push({
                                            startTime: slot.startTime,
                                            endTime: slot.endTime,
                                            resourceId: resourceId,
                                        })
                                    }
                                })
                            }
                        }
                    )
                }

                Object.keys(slotsGroupedByDate).forEach((date) => {
                    slotsGroupedByDate[date].sort(
                        (a, b) =>
                            new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime()
                    )
                })

                debugLog(
                    `Found ${Object.keys(slotsGroupedByDate).length} available dates`
                )
                setAvailableSlots(slotsGroupedByDate)
            } catch (err) {
                debugLog("Error loading availability", err)
                setError(err.message || "Unable to load availability")
            } finally {
                setLoading(false)
            }
        }

        fetchAvailability()
    }, [
        currentYear,
        currentMonth,
        currentWeekStart,
        selectedServiceId,
        debugLog,
        activeServices.length,
        apiConfig,
        features.calendarView,
    ])

    /**
     * Calendar Navigation Functions
     */
    const navigateToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear((prev) => prev - 1)
            setCurrentMonth(11)
        } else {
            setCurrentMonth((prev) => prev - 1)
        }
    }

    const navigateToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear((prev) => prev + 1)
            setCurrentMonth(0)
        } else {
            setCurrentMonth((prev) => prev + 1)
        }
    }

    const returnToCurrentMonth = () => {
        setCurrentYear(today.getFullYear())
        setCurrentMonth(today.getMonth())
    }

    /**
     * Week Navigation Functions
     */
    const navigateToPreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart)
        newWeekStart.setDate(currentWeekStart.getDate() - 7)
        setCurrentWeekStart(newWeekStart)
    }

    const navigateToNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart)
        newWeekStart.setDate(currentWeekStart.getDate() + 7)
        setCurrentWeekStart(newWeekStart)
    }

    const returnToCurrentWeek = () => {
        const todayDay = today.getDay()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(
            today.getDate() - (todayDay === 0 ? 6 : todayDay - 1)
        )
        startOfWeek.setHours(0, 0, 0, 0)
        setCurrentWeekStart(startOfWeek)
    }

    /**
     * Get week title for navigation
     */
    const getWeekTitle = () => {
        const weekEnd = new Date(currentWeekStart)
        weekEnd.setDate(currentWeekStart.getDate() + 6)

        const isCurrentWeek = () => {
            const todayDay = today.getDay()
            const thisWeekStart = new Date(today)
            thisWeekStart.setDate(
                today.getDate() - (todayDay === 0 ? 6 : todayDay - 1)
            )
            thisWeekStart.setHours(0, 0, 0, 0)
            return currentWeekStart.getTime() === thisWeekStart.getTime()
        }

        if (isCurrentWeek()) {
            return CURRENT_WEEK
        }

        return `${WEEK_OF} ${formatDateForWeekDisplay(currentWeekStart)} ${TO} ${formatDateForWeekDisplay(weekEnd)}`
    }

    /**
     * Booking Flow Functions
     */
    const handleDateSelection = (dateString) => {
        setSelectedDate(dateString)
        setSelectedTimeSlot(null)
        setShowTimeSelection(true)
    }

    const handleTimeSlotSelection = (timeSlot) => {
        setSelectedTimeSlot(timeSlot)
        setShowTimeSelection(false)
        setShowBookingForm(true)
    }

    const handleCustomerInfoChange = (e) => {
        const { name, value, type } = e.target
        const checked = "checked" in e.target ? e.target.checked : false
        setCustomerInfo({
            ...customerInfo,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    /**
     * MAIN BOOKING SUBMISSION FUNCTION
     * Handles the complete booking flow with Client API priority and Merchant API fallback
     */
    const handleBookingSubmit = async (e) => {
        e.preventDefault()

        // Dynamic form validation based on configuration
        if (
            checkboxes.terms.show &&
            checkboxes.terms.required &&
            !customerInfo.termsAccepted
        ) {
            alert("You must accept the terms and conditions")
            return
        }

        if (
            checkboxes.privacy.show &&
            checkboxes.privacy.required &&
            !customerInfo.privacyAccepted
        ) {
            alert("You must accept the privacy policy")
            return
        }

        // Validate required fields dynamically
        const requiredFields = Object.entries(formFields).filter(
            ([_, field]) => field.show && field.required
        )
        for (const [fieldName, field] of requiredFields) {
            const value = customerInfo[fieldName]
            if (typeof value === "string" && !value.trim()) {
                alert(`${field.label} is required`)
                return
            }
        }

        if (!selectedTimeSlot) {
            alert("No time slot selected")
            return
        }

        setIsBooking(true)
        debugLog("Starting booking process", { selectedTimeSlot, customerInfo })

        try {
            const service = activeServices.find(
                (s) => s.id === selectedServiceId
            )
            if (!service) throw new Error("Service not found")

            debugLog(
                "🚀 === STARTING BOOKING WORKFLOW - CLIENT API PRIORITY ==="
            )

            /**
             * PRIORITY 1: BOOKLA CLIENT API
             */
            const clientPayload = {
                client: {
                    email: customerInfo.email.trim().toLowerCase(),
                    firstName: customerInfo.firstName.trim(),
                    lastName: customerInfo.lastName.trim(),
                    phone: customerInfo.phone.trim(),
                    ...(formFields.address.show &&
                        customerInfo.address && {
                            address: customerInfo.address.trim(),
                        }),
                    ...(formFields.city.show &&
                        customerInfo.city && {
                            city: customerInfo.city.trim(),
                        }),
                    ...(formFields.zipCode.show &&
                        customerInfo.zipCode && {
                            zipCode: customerInfo.zipCode.trim(),
                        }),
                    ...(formFields.company.show &&
                        customerInfo.company && {
                            company: customerInfo.company.trim(),
                        }),
                },
                companyID: apiConfig.organizationId,
                serviceID: selectedServiceId,
                resourceID: selectedTimeSlot.resourceId || apiConfig.resourceId,
                startTime: selectedTimeSlot.startTime,
                spots: 1,
                customPurchaseDescription: `Booking ${service.name} - ${texts.title}`,
                metaData: {
                    source: "framer_component_client_priority",
                    booking_policy: "prepayment",
                    payment_method: "bookla_integrated",
                    total_amount: features.showPrices
                        ? (service.basePrice + service.apaPrice).toString()
                        : "0",
                    service_name: service.name,
                    service_description: features.showDescriptions
                        ? service.description
                        : undefined,
                    service_duration: features.showDuration
                        ? service.duration
                        : undefined,
                    comments:
                        formFields.comments.show && customerInfo.comments
                            ? customerInfo.comments.trim()
                            : undefined,
                    newsletter_opt_in: checkboxes.newsletter.show
                        ? customerInfo.newsletterAccepted
                        : false,
                    privacy_accepted: checkboxes.privacy.show
                        ? customerInfo.privacyAccepted
                        : true,
                    created_at: new Date().toISOString(),
                    success_url: urls.successUrl,
                    cancel_url: urls.cancelUrl,
                    terms_url: urls.termsUrl,
                    privacy_url: urls.privacyUrl,
                },
            }

            debugLog("🎯 ATTEMPT 1: CLIENT API (PRIORITY)", clientPayload)

            let bookingResponse = await fetch(
                `${apiConfig.baseUrl}/api/v1/client/bookings`,
                {
                    method: "POST",
                    headers: {
                        "x-api-key": `${apiConfig.apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(clientPayload),
                }
            )

            let apiUsed = "Client API"

            /**
             * FALLBACK: BOOKLA MERCHANT API
             */
            if (!bookingResponse.ok) {
                debugLog("❌ Client API failed, trying Merchant API (fallback)")

                const merchantPayload = {
                    companyID: apiConfig.organizationId,
                    serviceID: selectedServiceId,
                    resourceID:
                        selectedTimeSlot.resourceId || apiConfig.resourceId,
                    startTime: selectedTimeSlot.startTime,
                    endTime: selectedTimeSlot.endTime,
                    spots: 1,
                    client: {
                        firstName: customerInfo.firstName.trim(),
                        lastName: customerInfo.lastName.trim(),
                        email: customerInfo.email.trim().toLowerCase(),
                        phone: customerInfo.phone.trim(),
                        ...(formFields.address.show &&
                            customerInfo.address && {
                                address: customerInfo.address.trim(),
                            }),
                        ...(formFields.city.show &&
                            customerInfo.city && {
                                city: customerInfo.city.trim(),
                            }),
                        ...(formFields.zipCode.show &&
                            customerInfo.zipCode && {
                                zipCode: customerInfo.zipCode.trim(),
                            }),
                        ...(formFields.company.show &&
                            customerInfo.company && {
                                company: customerInfo.company.trim(),
                            }),
                    },
                    status: "pending",
                    requirePayment: true,
                    termsAccepted: customerInfo.termsAccepted,
                    metadata: {
                        source: "framer_component_merchant_fallback",
                        payment_method: "bookla_integrated",
                        total_amount: features.showPrices
                            ? (service.basePrice + service.apaPrice).toString()
                            : "0",
                        service_name: service.name,
                        service_description: features.showDescriptions
                            ? service.description
                            : undefined,
                        service_duration: features.showDuration
                            ? service.duration
                            : undefined,
                        comments:
                            formFields.comments.show && customerInfo.comments
                                ? customerInfo.comments.trim()
                                : undefined,
                        newsletter_opt_in: checkboxes.newsletter.show
                            ? customerInfo.newsletterAccepted
                            : false,
                        privacy_accepted: checkboxes.privacy.show
                            ? customerInfo.privacyAccepted
                            : true,
                        created_at: new Date().toISOString(),
                    },
                }

                debugLog(
                    "🔄 ATTEMPT 2: MERCHANT API (FALLBACK)",
                    merchantPayload
                )

                bookingResponse = await fetch(
                    `${apiConfig.baseUrl}/api/v1/companies/${apiConfig.organizationId}/bookings`,
                    {
                        method: "POST",
                        headers: {
                            "X-API-Key": apiConfig.apiKey,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(merchantPayload),
                    }
                )

                apiUsed = "Merchant API (fallback)"
            }

            // Check if booking was successful
            if (!bookingResponse.ok) {
                const errorText = await bookingResponse.text()
                debugLog("❌ ALL APIs FAILED", errorText)
                throw new Error(
                    `Booking error: ${bookingResponse.status} - ${errorText}`
                )
            }

            const bookingData = await bookingResponse.json()
            debugLog(`✅ Booking created with ${apiUsed}`, bookingData)

            // Extract booking information from response
            const bookingId =
                bookingData.id ||
                bookingData.bookingId ||
                bookingData.booking?.id
            const status =
                bookingData.status || bookingData.booking?.status || "pending"
            const paymentUrl =
                bookingData.paymentURL || bookingData.data?.paymentURL

            // Show success state
            setBookingSuccess({
                bookingId,
                status,
                paymentUrl,
                manualPayment: !paymentUrl,
                apiUsed,
            })

            // Auto-redirect to payment if URL is available
            if (paymentUrl) {
                debugLog(`💳 Payment URL: ${paymentUrl}`)
                setTimeout(() => {
                    debugLog("🚀 Redirecting to payment...")
                    window.open(paymentUrl, "_blank")
                }, 3000)
            }

            // Reset form state
            setShowBookingForm(false)
            setShowTimeSelection(false)
            setSelectedDate(null)
            setSelectedTimeSlot(null)
            setCustomerInfo({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                zipCode: "",
                company: "",
                comments: "",
                termsAccepted: false,
                privacyAccepted: false,
                newsletterAccepted: false,
            })
        } catch (error) {
            debugLog("❌ Critical error", error)
            alert(`Error: ${error.message}`)
        } finally {
            setIsBooking(false)
        }
    }

    /**
     * Utility Functions
     */
    const getCurrentService = () => {
        return activeServices.find(
            (service) => service.id === selectedServiceId
        )
    }

    const getAvailableDates = () => {
        return Object.keys(availableSlots).filter(
            (date) => availableSlots[date].length > 0
        )
    }

    /**
     * ERROR STATE: No Active Services
     */
    if (activeServices.length === 0) {
        return (
            <div
                style={{
                    width: "100%",
                    maxWidth: `${layout.maxWidth}px`,
                    backgroundColor: theme.backgroundColor,
                    borderRadius: `${theme.borderRadius}px`,
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                    padding: `${responsive.containerPadding}px`,
                    fontFamily: theme.fontFamily,
                    fontSize: `${responsive.fontSize}px`,
                    color: theme.textColor,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: `${responsive.elementSpacing}px`,
                    boxSizing: "border-box",
                    minHeight: "400px",
                }}
            >
                <div style={{ fontSize: isMobile ? "32px" : "48px" }}>⚠️</div>
                <h3
                    style={{
                        margin: 0,
                        fontSize: `${responsive.fontSize * 1.5}px`,
                    }}
                >
                    No Active Services
                </h3>
                <p style={{ margin: 0, color: `${theme.textColor}99` }}>
                    Please enable at least one service in the Framer properties
                    panel
                </p>
            </div>
        )
    }

    /**
     * CALENDAR DAYS GENERATION WITH IMPROVED MOBILE RESPONSIVITY
     */
    const generateCalendarDays = () => {
        if (features.calendarView === "week") {
            const calendarDays = []

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(currentWeekStart)
                currentDate.setDate(currentWeekStart.getDate() + i)

                const dateString = formatDateString(currentDate)
                const daySlots = availableSlots[dateString] || []
                const isDateAvailable = daySlots.length > 0
                const isCurrentDay = isToday(currentDate)
                const isPastDate = isDateInPast(currentDate)

                let dayStyle = {
                    aspectRatio: "1",
                    backgroundColor: isDateAvailable
                        ? "#dcfce7"
                        : theme.unavailableColor,
                    borderRadius: `${theme.borderRadius * 0.5}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    cursor:
                        isDateAvailable && !isPastDate ? "pointer" : "default",
                    border: `2px solid ${isDateAvailable ? "#bbf7d0" : "transparent"}`,
                    transition: "all 0.3s ease",
                    opacity: isPastDate ? 0.3 : 1,
                    fontFamily: theme.fontFamily,
                    fontSize: `${responsive.fontSize * (isMobile ? 0.75 : 0.9)}px`,
                    color: theme.textColor,
                    padding: `${responsive.calendarCellPadding}px`,
                    boxSizing: "border-box",
                    minWidth: 0,
                    overflow: "hidden",
                }

                if (isCurrentDay) {
                    dayStyle.border = `2px solid ${theme.primaryColor}`
                    dayStyle.backgroundColor = `${theme.primaryColor}20`
                    dayStyle.fontWeight = "bold"
                }

                calendarDays.push(
                    <div
                        key={`week-day-${dateString}`}
                        style={dayStyle}
                        onClick={() => {
                            if (isDateAvailable && !isPastDate) {
                                debugLog(`Clicked on week date: ${dateString}`)
                                handleDateSelection(dateString)
                            }
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "500",
                                fontSize: `${responsive.fontSize * (isMobile ? 0.6 : 0.7)}px`,
                                textAlign: "center",
                                lineHeight: "1.2",
                            }}
                        >
                            {WEEKDAYS[i]}
                        </span>
                        <span
                            style={{
                                fontWeight: "600",
                                fontSize: `${responsive.fontSize * (isMobile ? 0.9 : 1.1)}px`,
                                textAlign: "center",
                                lineHeight: "1.2",
                            }}
                        >
                            {currentDate.getDate()}
                        </span>
                        {isDateAvailable && (
                            <div
                                style={{
                                    width: isMobile ? "4px" : "6px",
                                    height: isMobile ? "4px" : "6px",
                                    backgroundColor: "#16a34a",
                                    borderRadius: "50%",
                                    marginTop: "2px",
                                }}
                            ></div>
                        )}
                    </div>
                )
            }
            return calendarDays
        } else {
            // Month view
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
            const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
            const totalDaysInMonth = lastDayOfMonth.getDate()
            const startingWeekday = (firstDayOfMonth.getDay() + 6) % 7

            const calendarDays = []

            for (let emptyDay = 0; emptyDay < startingWeekday; emptyDay++) {
                calendarDays.push(
                    <div
                        key={`empty-${emptyDay}`}
                        style={{
                            aspectRatio: "1",
                            backgroundColor: "transparent",
                            borderRadius: `${theme.borderRadius * 0.5}px`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            border: `2px solid transparent`,
                            fontFamily: theme.fontFamily,
                            fontSize: `${responsive.fontSize * (isMobile ? 0.85 : 1)}px`,
                            color: theme.textColor,
                            padding: `${responsive.calendarCellPadding}px`,
                            boxSizing: "border-box",
                            minWidth: 0,
                            overflow: "hidden",
                        }}
                    ></div>
                )
            }

            for (
                let dayNumber = 1;
                dayNumber <= totalDaysInMonth;
                dayNumber++
            ) {
                const currentDate = new Date(
                    currentYear,
                    currentMonth,
                    dayNumber
                )
                const dateString = formatDateString(currentDate)
                const daySlots = availableSlots[dateString] || []
                const isDateAvailable = daySlots.length > 0
                const isCurrentDay = isToday(currentDate)
                const isPastDate = isDateInPast(currentDate)

                let dayStyle = {
                    aspectRatio: "1",
                    backgroundColor: isDateAvailable
                        ? "#dcfce7"
                        : theme.unavailableColor,
                    borderRadius: `${theme.borderRadius * 0.5}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    cursor:
                        isDateAvailable && !isPastDate ? "pointer" : "default",
                    border: `2px solid ${isDateAvailable ? "#bbf7d0" : "transparent"}`,
                    transition: "all 0.3s ease",
                    opacity: isPastDate ? 0.3 : 1,
                    fontFamily: theme.fontFamily,
                    fontSize: `${responsive.fontSize * (isMobile ? 0.85 : 1)}px`,
                    color: theme.textColor,
                    padding: `${responsive.calendarCellPadding}px`,
                    boxSizing: "border-box",
                    minWidth: 0,
                    overflow: "hidden",
                }

                if (isCurrentDay) {
                    dayStyle.border = `2px solid ${theme.primaryColor}`
                    dayStyle.backgroundColor = `${theme.primaryColor}20`
                    dayStyle.fontWeight = "bold"
                }

                calendarDays.push(
                    <div
                        key={`day-${dateString}`}
                        style={dayStyle}
                        onClick={() => {
                            if (isDateAvailable && !isPastDate) {
                                debugLog(`Clicked on date: ${dateString}`)
                                handleDateSelection(dateString)
                            }
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "500",
                                textAlign: "center",
                                lineHeight: "1.2",
                            }}
                        >
                            {dayNumber}
                        </span>
                        {isDateAvailable && (
                            <div
                                style={{
                                    width: isMobile ? "4px" : "6px",
                                    height: isMobile ? "4px" : "6px",
                                    backgroundColor: "#16a34a",
                                    borderRadius: "50%",
                                    marginTop: "2px",
                                }}
                            ></div>
                        )}
                    </div>
                )
            }

            return calendarDays
        }
    }

    /**
     * MAIN COMPONENT STYLES - FULLY ADAPTIVE HEIGHT
     */
    const containerStyle = {
        width: "100%",
        maxWidth: `${layout.maxWidth}px`,
        backgroundColor: theme.backgroundColor,
        borderRadius: `${theme.borderRadius}px`,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        padding: `${responsive.containerPadding}px`,
        fontFamily: theme.fontFamily,
        fontSize: `${responsive.fontSize}px`,
        color: theme.textColor,
        position: "relative",
        boxSizing: "border-box",
        // HAUTEUR COMPLÈTEMENT ADAPTATIVE
        height: "auto",
        minHeight: "auto",
    }

    /**
     * MODAL STYLES FOR PORTALS - GUARANTEED TOP LAYER
     */
    const modalOverlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        // ULTIMATE Z-INDEX - RENDERED OUTSIDE COMPONENT HIERARCHY
        zIndex: 999999999,
        padding: `${responsive.elementSpacing}px`,
    }

    const modalContentStyle = {
        backgroundColor: theme.backgroundColor,
        borderRadius: `${theme.borderRadius * 2}px`,
        padding: `${responsive.modalPadding}px`,
        boxShadow: "0 50px 100px -12px rgba(0, 0, 0, 0.8)",
        position: "relative",
        zIndex: 999999999,
        maxHeight: "95vh",
        overflowY: "auto",
        width: "100%",
        maxWidth: isMobile ? "95vw" : "512px",
    }

    /**
     * MAIN COMPONENT RENDER
     */
    return (
        <>
            <div style={containerStyle}>
                {/* Header Section */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: `${responsive.sectionSpacing}px`,
                    }}
                >
                    {texts.showTitle && (
                        <h1
                            style={{
                                fontSize: `${responsive.fontSize * (isMobile ? 1.5 : 1.75)}px`,
                                fontWeight: "700",
                                marginBottom: "8px",
                                lineHeight: "1.3",
                                margin: "0 0 8px 0",
                            }}
                        >
                            {texts.title}
                        </h1>
                    )}
                    {texts.showSubtitle && (
                        <p
                            style={{
                                fontSize: `${responsive.fontSize * (isMobile ? 0.95 : 1.1)}px`,
                                color: `${theme.textColor}99`,
                                marginBottom: "0",
                                margin: "0",
                            }}
                        >
                            {texts.subtitle}
                        </p>
                    )}
                </div>

                {/* Service Selection Section */}
                {shouldShowServiceSelection && (
                    <div
                        style={{
                            marginBottom: `${responsive.sectionSpacing}px`,
                            textAlign: "center",
                        }}
                    >
                        {texts.showServiceLabel && (
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: `${responsive.elementSpacing}px`,
                                    fontWeight: "600",
                                    fontSize: `${responsive.fontSize * (isMobile ? 0.95 : 1.1)}px`,
                                }}
                            >
                                {texts.serviceLabel}
                            </label>
                        )}
                        <select
                            value={selectedServiceId}
                            onChange={(e) =>
                                setSelectedServiceId(e.target.value)
                            }
                            style={{
                                padding: `${responsive.elementSpacing}px 20px`,
                                borderRadius: `${theme.borderRadius * 0.75}px`,
                                border: `2px solid ${theme.borderColor}`,
                                backgroundColor: theme.backgroundColor,
                                color: theme.textColor,
                                fontSize: `${responsive.fontSize}px`,
                                fontFamily: theme.fontFamily,
                                width: "100%",
                                maxWidth: isMobile ? "100%" : "400px",
                                cursor: "pointer",
                                outline: "none",
                            }}
                            disabled={loading}
                        >
                            {activeServices.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>

                        {/* Service Details Display */}
                        {getCurrentService() &&
                            (features.showDescriptions ||
                                features.showDuration ||
                                features.showPrices) && (
                                <div
                                    style={{
                                        marginTop: `${responsive.elementSpacing}px`,
                                        padding: `${responsive.elementSpacing}px`,
                                        backgroundColor: theme.secondaryColor,
                                        borderRadius: `${theme.borderRadius * 0.75}px`,
                                        textAlign: "center",
                                        maxWidth: isMobile ? "100%" : "400px",
                                        margin: `${responsive.elementSpacing}px auto 0`,
                                    }}
                                >
                                    {features.showDescriptions &&
                                        getCurrentService().description && (
                                            <div
                                                style={{
                                                    fontSize: `${responsive.fontSize * 0.9}px`,
                                                    color: `${theme.textColor}CC`,
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                {
                                                    getCurrentService()
                                                        .description
                                                }
                                            </div>
                                        )}

                                    {features.showDuration &&
                                        getCurrentService().duration && (
                                            <div
                                                style={{
                                                    fontSize: `${responsive.fontSize * 0.85}px`,
                                                    color: `${theme.textColor}99`,
                                                    marginBottom:
                                                        features.showPrices
                                                            ? "8px"
                                                            : "0",
                                                }}
                                            >
                                                Duration:{" "}
                                                {getCurrentService().duration}
                                            </div>
                                        )}

                                    {features.showPrices &&
                                        (() => {
                                            const priceDisplay =
                                                getPriceDisplay(
                                                    getCurrentService()
                                                )
                                            if (priceDisplay?.breakdown) {
                                                return priceDisplay.breakdown
                                            } else if (priceDisplay?.simple) {
                                                return (
                                                    <div
                                                        style={{
                                                            fontSize: `${responsive.fontSize * 1.25}px`,
                                                            fontWeight: "700",
                                                            color: theme.primaryColor,
                                                            marginTop: "8px",
                                                        }}
                                                    >
                                                        {PRICE_LABEL}:{" "}
                                                        {priceDisplay.simple}
                                                    </div>
                                                )
                                            }
                                            return null
                                        })()}
                                </div>
                            )}
                    </div>
                )}

                {/* Calendar Navigation - Month View */}
                {features.calendarView === "month" && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: `${responsive.sectionSpacing}px`,
                            gap: `${responsive.elementSpacing}px`,
                        }}
                    >
                        <button
                            onClick={navigateToPreviousMonth}
                            style={{
                                backgroundColor: theme.secondaryColor,
                                border: "none",
                                borderRadius: `${theme.borderRadius * 0.75}px`,
                                fontSize: `${responsive.fontSize * (isMobile ? 1.2 : 1.5)}px`,
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: isMobile ? "40px" : "48px",
                                height: isMobile ? "40px" : "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.textColor,
                                transition: "all 0.2s ease",
                                flexShrink: 0,
                            }}
                            disabled={loading}
                        >
                            &#8249;
                        </button>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: `${Math.max(8, responsive.elementSpacing * 0.5)}px`,
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: `${responsive.fontSize * (isMobile ? 1.25 : 1.5)}px`,
                                    fontWeight: "700",
                                    textAlign: "center",
                                    margin: "0",
                                    whiteSpace: isMobile ? "nowrap" : "normal",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {MONTHS[currentMonth]} {currentYear}
                            </h2>
                            <button
                                onClick={returnToCurrentMonth}
                                style={{
                                    backgroundColor: theme.primaryColor,
                                    color: "white",
                                    padding: `${Math.max(6, responsive.elementSpacing * 0.5)}px ${Math.max(12, responsive.elementSpacing * 0.75)}px`,
                                    borderRadius: `${theme.borderRadius * 0.75}px`,
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.2s ease",
                                    fontSize: `${responsive.fontSize * (isMobile ? 0.85 : 1)}px`,
                                    fontFamily: theme.fontFamily,
                                    whiteSpace: "nowrap",
                                }}
                                disabled={loading}
                            >
                                {TODAY_BUTTON}
                            </button>
                        </div>

                        <button
                            onClick={navigateToNextMonth}
                            style={{
                                backgroundColor: theme.secondaryColor,
                                border: "none",
                                borderRadius: `${theme.borderRadius * 0.75}px`,
                                fontSize: `${responsive.fontSize * (isMobile ? 1.2 : 1.5)}px`,
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: isMobile ? "40px" : "48px",
                                height: isMobile ? "40px" : "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.textColor,
                                transition: "all 0.2s ease",
                                flexShrink: 0,
                            }}
                            disabled={loading}
                        >
                            &#8250;
                        </button>
                    </div>
                )}

                {/* Calendar Navigation - Week View */}
                {features.calendarView === "week" && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: `${responsive.sectionSpacing}px`,
                            gap: `${responsive.elementSpacing}px`,
                        }}
                    >
                        <button
                            onClick={navigateToPreviousWeek}
                            style={{
                                backgroundColor: theme.secondaryColor,
                                border: "none",
                                borderRadius: `${theme.borderRadius * 0.75}px`,
                                fontSize: `${responsive.fontSize * (isMobile ? 1.2 : 1.5)}px`,
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: isMobile ? "40px" : "48px",
                                height: isMobile ? "40px" : "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.textColor,
                                transition: "all 0.2s ease",
                                flexShrink: 0,
                            }}
                            disabled={loading}
                        >
                            &#8249;
                        </button>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: `${Math.max(8, responsive.elementSpacing * 0.5)}px`,
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: `${responsive.fontSize * (isMobile ? 1.1 : 1.3)}px`,
                                    fontWeight: "700",
                                    textAlign: "center",
                                    margin: "0",
                                    whiteSpace: isMobile ? "nowrap" : "normal",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {getWeekTitle()}
                            </h2>
                            <button
                                onClick={returnToCurrentWeek}
                                style={{
                                    backgroundColor: theme.primaryColor,
                                    color: "white",
                                    padding: `${Math.max(6, responsive.elementSpacing * 0.5)}px ${Math.max(12, responsive.elementSpacing * 0.75)}px`,
                                    borderRadius: `${theme.borderRadius * 0.75}px`,
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.2s ease",
                                    fontSize: `${responsive.fontSize * (isMobile ? 0.85 : 1)}px`,
                                    fontFamily: theme.fontFamily,
                                    whiteSpace: "nowrap",
                                }}
                                disabled={loading}
                            >
                                {TODAY_BUTTON}
                            </button>
                        </div>

                        <button
                            onClick={navigateToNextWeek}
                            style={{
                                backgroundColor: theme.secondaryColor,
                                border: "none",
                                borderRadius: `${theme.borderRadius * 0.75}px`,
                                fontSize: `${responsive.fontSize * (isMobile ? 1.2 : 1.5)}px`,
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: isMobile ? "40px" : "48px",
                                height: isMobile ? "40px" : "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.textColor,
                                transition: "all 0.2s ease",
                                flexShrink: 0,
                            }}
                            disabled={loading}
                        >
                            &#8250;
                        </button>
                    </div>
                )}

                {/* Calendar Weekday Headers - Only for month view */}
                {features.calendarView === "month" && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: `${responsive.calendarGap}px`,
                            marginBottom: `${responsive.elementSpacing}px`,
                        }}
                    >
                        {WEEKDAYS.map((weekday) => (
                            <div
                                key={weekday}
                                style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    padding: `${responsive.calendarCellPadding}px`,
                                    fontSize: `${responsive.fontSize * (isMobile ? 0.75 : 0.9)}px`,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    boxSizing: "border-box",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {weekday}
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Calendar Grid - HAUTEUR ADAPTATIVE AMÉLIORÉE */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: `${responsive.calendarGap}px`,
                        width: "100%",
                        marginBottom: `${responsive.sectionSpacing}px`,
                    }}
                >
                    {loading ? (
                        // Loading State
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: isMobile ? "40px 0" : "60px 0",
                                gap: "20px",
                            }}
                        >
                            <div
                                style={{
                                    width: isMobile ? "30px" : "40px",
                                    height: isMobile ? "30px" : "40px",
                                    border: `4px solid ${theme.secondaryColor}`,
                                    borderTop: `4px solid ${theme.primaryColor}`,
                                    borderRadius: "50%",
                                    animation: "spin-framer 1s linear infinite",
                                }}
                            ></div>
                            <p
                                style={{
                                    fontSize: `${responsive.fontSize}px`,
                                    fontWeight: "500",
                                    margin: "0",
                                    textAlign: "center",
                                }}
                            >
                                {texts.loadingText}
                            </p>
                        </div>
                    ) : error ? (
                        // Error State
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: isMobile ? "40px 0" : "60px 0",
                                gap: "20px",
                                textAlign: "center",
                            }}
                        >
                            <div
                                style={{ fontSize: isMobile ? "32px" : "48px" }}
                            >
                                ⚠️
                            </div>
                            <p
                                style={{
                                    color: "#dc2626",
                                    fontWeight: "600",
                                    maxWidth: "384px",
                                    margin: "0",
                                    fontSize: `${responsive.fontSize}px`,
                                }}
                            >
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    backgroundColor: theme.primaryColor,
                                    color: "white",
                                    padding: "12px 24px",
                                    borderRadius: `${theme.borderRadius * 0.75}px`,
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    border: "none",
                                    fontSize: `${responsive.fontSize}px`,
                                    fontFamily: theme.fontFamily,
                                }}
                            >
                                {texts.errorRetryButton}
                            </button>
                        </div>
                    ) : (
                        generateCalendarDays()
                    )}
                </div>

                {/* CSS Animations */}
                <style>{`
                    @keyframes spin-framer {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>

                {/* Optional Legend */}
                {features.showLegend && (
                    <div
                        style={{
                            paddingTop: "24px",
                            borderTop: `1px solid ${theme.borderColor}`,
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: isMobile
                                    ? `${responsive.elementSpacing}px`
                                    : `${responsive.sectionSpacing}px`,
                                marginBottom: `${responsive.elementSpacing}px`,
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "12px",
                                        height: "12px",
                                        backgroundColor: "#16a34a",
                                        borderRadius: "50%",
                                    }}
                                ></div>
                                <span
                                    style={{
                                        fontSize: `${responsive.fontSize * 0.9}px`,
                                    }}
                                >
                                    {texts.availableLabel}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "12px",
                                        height: "12px",
                                        backgroundColor: theme.primaryColor,
                                        borderRadius: "50%",
                                    }}
                                ></div>
                                <span
                                    style={{
                                        fontSize: `${responsive.fontSize * 0.9}px`,
                                    }}
                                >
                                    {TODAY_BUTTON}
                                </span>
                            </div>
                        </div>

                        {!loading && !error && (
                            <p
                                style={{
                                    fontWeight: "600",
                                    marginBottom: `${responsive.elementSpacing}px`,
                                    margin: `0 0 ${responsive.elementSpacing}px 0`,
                                    fontSize: `${responsive.fontSize}px`,
                                }}
                            >
                                {getAvailableDates().length} available day
                                {getAvailableDates().length !== 1
                                    ? "s"
                                    : ""}{" "}
                                for {getCurrentService()?.name}
                            </p>
                        )}

                        {texts.showFooterText && (
                            <p
                                style={{
                                    fontSize: `${responsive.fontSize * 0.85}px`,
                                    color: `${theme.textColor}99`,
                                    margin: "0",
                                }}
                            >
                                {texts.footerText}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* REACT PORTALS FOR MODALS - GUARANTEED ABOVE EVERYTHING */}

            {/* TIME SELECTION MODAL */}
            <ModalPortal isOpen={showTimeSelection && selectedDate}>
                <div style={modalOverlayStyle}>
                    <div
                        style={{
                            ...modalContentStyle,
                            maxWidth: isMobile ? "90vw" : "448px",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: `${responsive.fontSize * (isMobile ? 1.1 : 1.25)}px`,
                                fontWeight: "700",
                                textAlign: "center",
                                marginBottom: `${responsive.elementSpacing}px`,
                                margin: `0 0 ${responsive.elementSpacing}px 0`,
                            }}
                        >
                            {texts.chooseTimeTitle}
                        </h3>
                        <p
                            style={{
                                textAlign: "center",
                                marginBottom: "24px",
                                color: `${theme.textColor}99`,
                                margin: "0 0 24px 0",
                                fontSize: `${responsive.fontSize * (isMobile ? 0.9 : 1)}px`,
                            }}
                        >
                            Date:{" "}
                            {selectedDate && formatDateForDisplay(selectedDate)}
                        </p>

                        <div style={{ marginBottom: "24px" }}>
                            {selectedDate &&
                                (availableSlots[selectedDate] || []).map(
                                    (slot, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                handleTimeSlotSelection(slot)
                                            }
                                            style={{
                                                width: "100%",
                                                padding: `${responsive.elementSpacing}px`,
                                                border: `2px solid ${theme.borderColor}`,
                                                borderRadius: `${theme.borderRadius}px`,
                                                backgroundColor:
                                                    theme.backgroundColor,
                                                cursor: "pointer",
                                                marginBottom: "12px",
                                                textAlign: "left",
                                                transition: "all 0.2s ease",
                                                fontSize: `${responsive.fontSize}px`,
                                                fontFamily: theme.fontFamily,
                                            }}
                                        >
                                            <div style={{ fontWeight: "600" }}>
                                                {formatTimeString(
                                                    slot.startTime
                                                )}
                                                {slot.endTime &&
                                                    ` - ${formatTimeString(slot.endTime)}`}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: `${responsive.fontSize * 0.9}px`,
                                                    color: `${theme.textColor}99`,
                                                }}
                                            >
                                                {getCurrentService()?.name}
                                            </div>
                                        </button>
                                    )
                                )}
                        </div>

                        <button
                            onClick={() => setShowTimeSelection(false)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                backgroundColor: theme.secondaryColor,
                                color: theme.textColor,
                                borderRadius: `${theme.borderRadius}px`,
                                fontWeight: "600",
                                border: "none",
                                cursor: "pointer",
                                fontSize: `${responsive.fontSize}px`,
                                fontFamily: theme.fontFamily,
                            }}
                        >
                            {texts.cancelButton}
                        </button>
                    </div>
                </div>
            </ModalPortal>

            {/* BOOKING FORM MODAL */}
            <ModalPortal
                isOpen={showBookingForm && selectedDate && selectedTimeSlot}
            >
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3
                            style={{
                                fontSize: `${responsive.fontSize * (isMobile ? 1.1 : 1.25)}px`,
                                fontWeight: "700",
                                textAlign: "center",
                                marginBottom: `${responsive.elementSpacing}px`,
                                margin: `0 0 ${responsive.elementSpacing}px 0`,
                            }}
                        >
                            {texts.bookingTitle} - {getCurrentService()?.name}
                        </h3>
                        <p
                            style={{
                                textAlign: "center",
                                marginBottom: "8px",
                                color: `${theme.textColor}99`,
                                margin: "0 0 8px 0",
                                fontSize: `${responsive.fontSize * (isMobile ? 0.9 : 1)}px`,
                            }}
                        >
                            {selectedDate && formatDateForDisplay(selectedDate)}{" "}
                            at{" "}
                            {selectedTimeSlot &&
                                formatTimeString(selectedTimeSlot.startTime)}
                        </p>

                        <form
                            onSubmit={handleBookingSubmit}
                            style={{ marginTop: "24px" }}
                        >
                            {/* Dynamic Form Fields Generation */}
                            {Object.entries(formFields).map(
                                ([fieldName, fieldConfig]) => {
                                    if (!fieldConfig.show) return null

                                    const isTextarea = fieldName === "comments"
                                    const inputType =
                                        fieldName === "email"
                                            ? "email"
                                            : fieldName === "phone"
                                              ? "tel"
                                              : "text"

                                    return (
                                        <div
                                            key={fieldName}
                                            style={{
                                                marginBottom: `${responsive.elementSpacing}px`,
                                            }}
                                        >
                                            <label
                                                style={{
                                                    display: "block",
                                                    fontWeight: "600",
                                                    marginBottom: "8px",
                                                    fontSize: `${responsive.fontSize}px`,
                                                }}
                                            >
                                                {fieldConfig.label}{" "}
                                                {fieldConfig.required
                                                    ? "*"
                                                    : ""}
                                            </label>
                                            {isTextarea ? (
                                                <textarea
                                                    name={fieldName}
                                                    value={
                                                        customerInfo[
                                                            fieldName
                                                        ] || ""
                                                    }
                                                    onChange={
                                                        handleCustomerInfoChange
                                                    }
                                                    placeholder={
                                                        fieldConfig.placeholder
                                                    }
                                                    rows={3}
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px",
                                                        borderRadius: `${theme.borderRadius}px`,
                                                        border: `2px solid ${theme.borderColor}`,
                                                        fontSize: `${responsive.fontSize}px`,
                                                        fontFamily:
                                                            theme.fontFamily,
                                                        outline: "none",
                                                        boxSizing: "border-box",
                                                        resize: "vertical",
                                                    }}
                                                    required={
                                                        fieldConfig.required
                                                    }
                                                />
                                            ) : (
                                                <input
                                                    type={inputType}
                                                    name={fieldName}
                                                    value={
                                                        customerInfo[
                                                            fieldName
                                                        ] || ""
                                                    }
                                                    onChange={
                                                        handleCustomerInfoChange
                                                    }
                                                    placeholder={
                                                        fieldConfig.placeholder
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px",
                                                        borderRadius: `${theme.borderRadius}px`,
                                                        border: `2px solid ${theme.borderColor}`,
                                                        fontSize: `${responsive.fontSize}px`,
                                                        fontFamily:
                                                            theme.fontFamily,
                                                        outline: "none",
                                                        boxSizing: "border-box",
                                                    }}
                                                    required={
                                                        fieldConfig.required
                                                    }
                                                />
                                            )}
                                        </div>
                                    )
                                }
                            )}

                            {/* Dynamic Checkboxes */}
                            {(checkboxes.terms.show ||
                                checkboxes.privacy.show ||
                                checkboxes.newsletter.show) && (
                                <div
                                    style={{
                                        padding: `${responsive.elementSpacing}px`,
                                        backgroundColor: theme.secondaryColor,
                                        border: `1px solid ${theme.borderColor}`,
                                        borderRadius: `${theme.borderRadius}px`,
                                        marginBottom: `${responsive.elementSpacing}px`,
                                    }}
                                >
                                    {Object.entries(checkboxes).map(
                                        ([checkboxName, checkboxConfig]) => {
                                            if (!checkboxConfig.show)
                                                return null

                                            return (
                                                <label
                                                    key={checkboxName}
                                                    style={{
                                                        display: "flex",
                                                        alignItems:
                                                            "flex-start",
                                                        gap: "12px",
                                                        cursor: "pointer",
                                                        fontSize: `${responsive.fontSize * 0.9}px`,
                                                        marginBottom: "12px",
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name={`${checkboxName}Accepted`}
                                                        checked={
                                                            customerInfo[
                                                                `${checkboxName}Accepted`
                                                            ] || false
                                                        }
                                                        onChange={
                                                            handleCustomerInfoChange
                                                        }
                                                        style={{
                                                            width: "16px",
                                                            height: "16px",
                                                            cursor: "pointer",
                                                            marginTop: "2px",
                                                            flexShrink: 0,
                                                        }}
                                                        required={
                                                            checkboxConfig.required
                                                        }
                                                    />
                                                    <span>
                                                        {checkboxConfig.label}{" "}
                                                        {checkboxConfig.required
                                                            ? "*"
                                                            : ""}
                                                        {checkboxName ===
                                                            "terms" && (
                                                            <>
                                                                {" "}
                                                                <a
                                                                    href={
                                                                        urls.termsUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        color: theme.primaryColor,
                                                                        textDecoration:
                                                                            "underline",
                                                                    }}
                                                                >
                                                                    terms and
                                                                    conditions
                                                                </a>
                                                            </>
                                                        )}
                                                        {checkboxName ===
                                                            "privacy" && (
                                                            <>
                                                                {" "}
                                                                <a
                                                                    href={
                                                                        urls.privacyUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        color: theme.primaryColor,
                                                                        textDecoration:
                                                                            "underline",
                                                                    }}
                                                                >
                                                                    privacy
                                                                    policy
                                                                </a>
                                                            </>
                                                        )}
                                                    </span>
                                                </label>
                                            )
                                        }
                                    )}
                                </div>
                            )}

                            {/* Form Action Buttons */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: `${responsive.elementSpacing}px`,
                                    paddingTop: `${responsive.elementSpacing}px`,
                                    flexDirection: isMobile ? "column" : "row",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBookingForm(false)
                                        setShowTimeSelection(true)
                                    }}
                                    style={{
                                        flex: isMobile ? "none" : 1,
                                        padding: "12px",
                                        backgroundColor: theme.secondaryColor,
                                        color: theme.textColor,
                                        fontWeight: "600",
                                        border: "none",
                                        borderRadius: `${theme.borderRadius}px`,
                                        cursor: "pointer",
                                        fontSize: `${responsive.fontSize}px`,
                                        fontFamily: theme.fontFamily,
                                    }}
                                    disabled={isBooking}
                                >
                                    {texts.backButton}
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: isMobile ? "none" : 2,
                                        padding: "12px",
                                        backgroundColor: theme.primaryColor,
                                        color: "white",
                                        fontWeight: "600",
                                        border: "none",
                                        borderRadius: `${theme.borderRadius}px`,
                                        cursor: "pointer",
                                        fontSize: `${responsive.fontSize}px`,
                                        fontFamily: theme.fontFamily,
                                        opacity: isBooking ? 0.5 : 1,
                                    }}
                                    disabled={isBooking}
                                >
                                    {isBooking
                                        ? texts.bookingInProgress
                                        : texts.bookingButton}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </ModalPortal>

            {/* SUCCESS MODAL */}
            <ModalPortal isOpen={!!bookingSuccess}>
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3
                            style={{
                                fontSize: `${responsive.fontSize * (isMobile ? 1.25 : 1.5)}px`,
                                fontWeight: "700",
                                textAlign: "center",
                                marginBottom: `${responsive.elementSpacing}px`,
                                color: theme.primaryColor,
                                margin: `0 0 ${responsive.elementSpacing}px 0`,
                            }}
                        >
                            {texts.successTitle}
                        </h3>

                        <div style={{ marginBottom: "24px" }}>
                            <div
                                style={{
                                    padding: `${responsive.elementSpacing}px`,
                                    backgroundColor: "#dcfce7",
                                    borderRadius: `${theme.borderRadius}px`,
                                    border: "1px solid #bbf7d0",
                                    textAlign: "center",
                                    marginTop: `${responsive.elementSpacing}px`,
                                }}
                            >
                                <p
                                    style={{
                                        color: "#166534",
                                        fontWeight: "600",
                                        margin: "0",
                                        fontSize: `${responsive.fontSize}px`,
                                    }}
                                >
                                    {texts.customSuccessMessage}
                                </p>
                            </div>

                            {bookingSuccess?.paymentUrl ? (
                                <div
                                    style={{
                                        padding: `${responsive.elementSpacing}px`,
                                        backgroundColor: "#dcfce7",
                                        borderRadius: `${theme.borderRadius}px`,
                                        border: "1px solid #bbf7d0",
                                        textAlign: "center",
                                        marginTop: `${responsive.elementSpacing}px`,
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "#166534",
                                            fontWeight: "600",
                                            margin: "0 0 8px 0",
                                            fontSize: `${responsive.fontSize}px`,
                                        }}
                                    >
                                        {texts.paymentRedirectText}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: `${responsive.fontSize * 0.9}px`,
                                            color: "#166534",
                                            margin: "0",
                                        }}
                                    >
                                        Secure Bookla Payment
                                    </p>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        padding: `${responsive.elementSpacing}px`,
                                        backgroundColor: "#fef3c7",
                                        borderRadius: `${theme.borderRadius}px`,
                                        border: "1px solid #fbbf24",
                                        textAlign: "center",
                                        marginTop: `${responsive.elementSpacing}px`,
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "#92400e",
                                            fontWeight: "600",
                                            margin: "0",
                                            fontSize: `${responsive.fontSize}px`,
                                        }}
                                    >
                                        {texts.emailInstructionsText}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setBookingSuccess(null)}
                            style={{
                                width: "100%",
                                backgroundColor: theme.primaryColor,
                                color: "white",
                                padding: "12px 24px",
                                borderRadius: `${theme.borderRadius}px`,
                                fontWeight: "600",
                                border: "none",
                                cursor: "pointer",
                                fontSize: `${responsive.fontSize}px`,
                                fontFamily: theme.fontFamily,
                            }}
                        >
                            {texts.closeButton}
                        </button>
                    </div>
                </div>
            </ModalPortal>
        </>
    )
}

// FRAMER PROPERTY CONTROLS CONFIGURATION
addPropertyControls(BooklaCalendarFramerComplete, {
    // API Configuration
    apiConfig: {
        type: ControlType.Object,
        title: "🔧 API Configuration",
        controls: {
            organizationId: {
                type: ControlType.String,
                title: "Organization ID",
                defaultValue: "OrganizationID",
                description: "Your Bookla organization/company ID",
            },
            apiKey: {
                type: ControlType.String,
                title: "API Key",
                defaultValue: "APIKey",
                description: "Your Bookla API key for authentication",
            },
            baseUrl: {
                type: ControlType.String,
                title: "Base URL",
                defaultValue: "https://us.bookla.com",
                description:
                    "Bookla API base URL (usually https://us.bookla.com)",
            },
            resourceId: {
                type: ControlType.String,
                title: "Resource ID",
                defaultValue: "RessourceID",
                description: "Default resource ID for bookings",
            },
        },
    },

    // Language Configuration
    language: {
        type: ControlType.Object,
        title: "🌍 Language & Calendar",
        controls: {
            calendar: {
                type: ControlType.Enum,
                title: "Calendar Language",
                defaultValue: "french",
                options: [
                    "french",
                    "english",
                    "spanish",
                    "german",
                    "italian",
                    "portuguese",
                    "dutch",
                ],
                optionTitles: [
                    "Français",
                    "English",
                    "Español",
                    "Deutsch",
                    "Italiano",
                    "Português",
                    "Nederlands",
                ],
                description:
                    "Choose predefined language for months, weekdays and price labels",
            },
            customMonths: {
                type: ControlType.Array,
                title: "Custom Months (Optional)",
                propertyControl: {
                    type: ControlType.String,
                    title: "Month",
                },
                description:
                    "Override months with custom names (must provide all 12)",
                maxCount: 12,
            },
            customWeekdays: {
                type: ControlType.Array,
                title: "Custom Weekdays (Optional)",
                propertyControl: {
                    type: ControlType.String,
                    title: "Weekday",
                },
                description:
                    "Override weekdays with custom names (must provide all 7)",
                maxCount: 7,
            },
            customTodayButton: {
                type: ControlType.String,
                title: "Custom Today Button Text",
                defaultValue: "",
                description:
                    "Override today button text (leave empty to use language default)",
            },
        },
    },

    // Text Configuration
    texts: {
        type: ControlType.Object,
        title: "📝 Text Content",
        controls: {
            showTitle: {
                type: ControlType.Boolean,
                title: "Show Title",
                defaultValue: true,
            },
            title: {
                type: ControlType.String,
                title: "Main Title",
                defaultValue: "Réservation de Bateau",
            },
            showSubtitle: {
                type: ControlType.Boolean,
                title: "Show Subtitle",
                defaultValue: true,
            },
            subtitle: {
                type: ControlType.String,
                title: "Subtitle",
                defaultValue:
                    "Sélectionnez une date disponible pour réserver votre service",
            },
            showServiceLabel: {
                type: ControlType.Boolean,
                title: "Show Service Label",
                defaultValue: true,
            },
            serviceLabel: {
                type: ControlType.String,
                title: "Service Label",
                defaultValue: "Sélectionnez votre service :",
            },
            customSuccessMessage: {
                type: ControlType.String,
                title: "Custom Success Message",
                defaultValue:
                    "Merci pour la réservation, vous allez être redirigé vers la page de paiement",
                description:
                    "Custom message displayed in booking success modal",
            },
            todayButton: {
                type: ControlType.String,
                title: "Today Button",
                defaultValue: "Aujourd'hui",
            },
            availableLabel: {
                type: ControlType.String,
                title: "Available Label",
                defaultValue: "Disponible",
            },
            loadingText: {
                type: ControlType.String,
                title: "Loading Text",
                defaultValue: "Chargement des disponibilités...",
            },
            errorRetryButton: {
                type: ControlType.String,
                title: "Retry Button",
                defaultValue: "Réessayer",
            },
            chooseTimeTitle: {
                type: ControlType.String,
                title: "Choose Time Title",
                defaultValue: "Choisissez un horaire",
            },
            bookingTitle: {
                type: ControlType.String,
                title: "Booking Title",
                defaultValue: "Réservation",
            },
            bookingButton: {
                type: ControlType.String,
                title: "Book Button",
                defaultValue: "Réserver",
            },
            bookingInProgress: {
                type: ControlType.String,
                title: "Booking in Progress",
                defaultValue: "Réservation...",
            },
            backButton: {
                type: ControlType.String,
                title: "Back Button",
                defaultValue: "Retour",
            },
            cancelButton: {
                type: ControlType.String,
                title: "Cancel Button",
                defaultValue: "Annuler",
            },
            closeButton: {
                type: ControlType.String,
                title: "Close Button",
                defaultValue: "Fermer",
            },
            successTitle: {
                type: ControlType.String,
                title: "Success Title",
                defaultValue: "🎉 Réservation créée !",
            },
            paymentRedirectText: {
                type: ControlType.String,
                title: "Payment Redirect Text",
                defaultValue: "🚀 Redirection vers le paiement...",
            },
            emailInstructionsText: {
                type: ControlType.String,
                title: "Email Instructions Text",
                defaultValue: "📧 Instructions envoyées par email",
            },
            showFooterText: {
                type: ControlType.Boolean,
                title: "Show Footer Text",
                defaultValue: true,
            },
            footerText: {
                type: ControlType.String,
                title: "Footer Text",
                defaultValue: "Paiement sécurisé 100% géré par Bookla",
            },
        },
    },

    // URL Configuration
    urls: {
        type: ControlType.Object,
        title: "🔗 URLs",
        controls: {
            successUrl: {
                type: ControlType.String,
                title: "Success URL",
                defaultValue: "https://loupinedou-yacht.fr/confirmation-page",
                description: "Redirect URL after successful payment",
            },
            cancelUrl: {
                type: ControlType.String,
                title: "Cancel URL",
                defaultValue: "https://loupinedou-yacht.fr/error-page",
                description: "Redirect URL after cancelled payment",
            },
            termsUrl: {
                type: ControlType.String,
                title: "Terms URL",
                defaultValue: "https://loupinedou-yacht.fr/conditions",
                description: "Link to terms and conditions page",
            },
            privacyUrl: {
                type: ControlType.String,
                title: "Privacy URL",
                defaultValue: "https://loupinedou-yacht.fr/privacy",
                description: "Link to privacy policy page",
            },
        },
    },

    // Services Configuration
    servicesCount: {
        type: ControlType.Number,
        title: "🚢 Number of Services",
        defaultValue: 3,
        min: 1,
        max: 3,
        step: 1,
        description: "How many services to show (1-3)",
    },

    service1: {
        type: ControlType.Object,
        title: "Service 1",
        controls: {
            enabled: {
                type: ControlType.Boolean,
                title: "Enable",
                defaultValue: true,
            },
            id: {
                type: ControlType.String,
                title: "Service ID",
                defaultValue: "Service 1",
            },
            name: {
                type: ControlType.String,
                title: "Name",
                defaultValue: "Service Journée",
            },
            description: {
                type: ControlType.String,
                title: "Description",
                defaultValue: "Une journée complète de navigation",
            },
            basePrice: {
                type: ControlType.Number,
                title: "Base Price",
                defaultValue: 300,
                min: 0,
                step: 10,
            },
            apaPrice: {
                type: ControlType.Number,
                title: "APA Price",
                defaultValue: 100,
                min: 0,
                step: 10,
            },
            duration: {
                type: ControlType.String,
                title: "Duration",
                defaultValue: "8 heures",
            },
        },
    },

    service2: {
        type: ControlType.Object,
        title: "Service 2",
        hidden: (props) => (props.servicesCount || 3) < 2,
        controls: {
            enabled: {
                type: ControlType.Boolean,
                title: "Enable",
                defaultValue: true,
            },
            id: {
                type: ControlType.String,
                title: "Service ID",
                defaultValue: "Service 2",
            },
            name: {
                type: ControlType.String,
                title: "Name",
                defaultValue: "Service Sunset",
            },
            description: {
                type: ControlType.String,
                title: "Description",
                defaultValue: "Navigation au coucher du soleil",
            },
            basePrice: {
                type: ControlType.Number,
                title: "Base Price",
                defaultValue: 200,
                min: 0,
                step: 10,
            },
            apaPrice: {
                type: ControlType.Number,
                title: "APA Price",
                defaultValue: 50,
                min: 0,
                step: 10,
            },
            duration: {
                type: ControlType.String,
                title: "Duration",
                defaultValue: "4 heures",
            },
        },
    },

    service3: {
        type: ControlType.Object,
        title: "Service 3",
        hidden: (props) => (props.servicesCount || 3) < 3,
        controls: {
            enabled: {
                type: ControlType.Boolean,
                title: "Enable",
                defaultValue: true,
            },
            id: {
                type: ControlType.String,
                title: "Service ID",
                defaultValue: "Service 3",
            },
            name: {
                type: ControlType.String,
                title: "Name",
                defaultValue: "Service Mix",
            },
            description: {
                type: ControlType.String,
                title: "Description",
                defaultValue: "Formule personnalisée",
            },
            basePrice: {
                type: ControlType.Number,
                title: "Base Price",
                defaultValue: 350,
                min: 0,
                step: 10,
            },
            apaPrice: {
                type: ControlType.Number,
                title: "APA Price",
                defaultValue: 120,
                min: 0,
                step: 10,
            },
            duration: {
                type: ControlType.String,
                title: "Duration",
                defaultValue: "Sur mesure",
            },
        },
    },

    // Form Fields Configuration
    formFields: {
        type: ControlType.Object,
        title: "📝 Form Fields",
        controls: {
            firstName: {
                type: ControlType.Object,
                title: "First Name",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: true,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: true,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Prénom",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "Votre prénom",
                    },
                },
            },
            lastName: {
                type: ControlType.Object,
                title: "Last Name",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: true,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: true,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Nom",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "Votre nom",
                    },
                },
            },
            email: {
                type: ControlType.Object,
                title: "Email",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: true,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: true,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Email",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "votre@email.com",
                    },
                },
            },
            phone: {
                type: ControlType.Object,
                title: "Phone",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: true,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: true,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Téléphone",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "0123456789",
                    },
                },
            },
            address: {
                type: ControlType.Object,
                title: "Address",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: false,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: false,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Adresse",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "Votre adresse",
                    },
                },
            },
            city: {
                type: ControlType.Object,
                title: "City",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: false,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: false,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Ville",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "Votre ville",
                    },
                },
            },
            zipCode: {
                type: ControlType.Object,
                title: "Zip Code",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: false,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: false,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Code postal",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "12345",
                    },
                },
            },
            company: {
                type: ControlType.Object,
                title: "Company",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: false,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: false,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Entreprise",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "Nom de votre entreprise",
                    },
                },
            },
            comments: {
                type: ControlType.Object,
                title: "Comments",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: false,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: false,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Commentaires",
                    },
                    placeholder: {
                        type: ControlType.String,
                        title: "Placeholder",
                        defaultValue: "Vos commentaires...",
                    },
                },
            },
        },
    },

    // Checkboxes Configuration
    checkboxes: {
        type: ControlType.Object,
        title: "☑️ Checkboxes",
        controls: {
            terms: {
                type: ControlType.Object,
                title: "Terms & Conditions",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: true,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: true,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "J'accepte les conditions générales",
                    },
                },
            },
            privacy: {
                type: ControlType.Object,
                title: "Privacy Policy",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: false,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: false,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue:
                            "J'accepte la politique de confidentialité",
                    },
                },
            },
            newsletter: {
                type: ControlType.Object,
                title: "Newsletter",
                controls: {
                    show: {
                        type: ControlType.Boolean,
                        title: "Show",
                        defaultValue: false,
                    },
                    required: {
                        type: ControlType.Boolean,
                        title: "Required",
                        defaultValue: false,
                    },
                    label: {
                        type: ControlType.String,
                        title: "Label",
                        defaultValue: "Je souhaite recevoir la newsletter",
                    },
                },
            },
        },
    },

    // Theme Configuration
    theme: {
        type: ControlType.Object,
        title: "🎨 Theme",
        controls: {
            primaryColor: {
                type: ControlType.Color,
                title: "Primary Color",
                defaultValue: "#16a34a",
            },
            secondaryColor: {
                type: ControlType.Color,
                title: "Secondary Color",
                defaultValue: "#f1f5f9",
            },
            backgroundColor: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: "#ffffff",
            },
            textColor: {
                type: ControlType.Color,
                title: "Text Color",
                defaultValue: "#374151",
            },
            borderColor: {
                type: ControlType.Color,
                title: "Border Color",
                defaultValue: "#e2e8f0",
            },
            unavailableColor: {
                type: ControlType.Color,
                title: "Unavailable Days Color",
                defaultValue: "#f1f5f9",
                description: "Background color for unavailable calendar days",
            },
            fontFamily: {
                type: ControlType.String,
                title: "Font Family",
                defaultValue:
                    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            },
            fontSize: {
                type: ControlType.Number,
                title: "Font Size",
                defaultValue: 16,
                min: 12,
                max: 24,
                step: 1,
            },
            borderRadius: {
                type: ControlType.Number,
                title: "Border Radius",
                defaultValue: 12,
                min: 0,
                max: 30,
                step: 1,
            },
        },
    },

    // Layout Configuration
    layout: {
        type: ControlType.Object,
        title: "📐 Layout & Spacing",
        controls: {
            maxWidth: {
                type: ControlType.Number,
                title: "Maximum Width",
                defaultValue: 800,
                min: 300,
                max: 1200,
                step: 50,
                description:
                    "Maximum width - component will be smaller if container is smaller",
            },
            containerPadding: {
                type: ControlType.Number,
                title: "Container Padding",
                defaultValue: 32,
                min: 8,
                max: 80,
                step: 4,
            },
            sectionSpacing: {
                type: ControlType.Number,
                title: "Section Spacing",
                defaultValue: 32,
                min: 8,
                max: 80,
                step: 4,
            },
            elementSpacing: {
                type: ControlType.Number,
                title: "Element Spacing",
                defaultValue: 16,
                min: 4,
                max: 40,
                step: 2,
            },
            calendarGap: {
                type: ControlType.Number,
                title: "Calendar Gap",
                defaultValue: 8,
                min: 2,
                max: 20,
                step: 2,
            },
            calendarCellPadding: {
                type: ControlType.Number,
                title: "Calendar Cell Padding",
                defaultValue: 8,
                min: 2,
                max: 24,
                step: 2,
                description: "Internal padding for each calendar day cell",
            },
            modalPadding: {
                type: ControlType.Number,
                title: "Modal Padding",
                defaultValue: 32,
                min: 8,
                max: 80,
                step: 4,
            },
        },
    },

    // Features Configuration
    features: {
        type: ControlType.Object,
        title: "⚙️ Features",
        controls: {
            showPrices: {
                type: ControlType.Boolean,
                title: "Show Prices",
                defaultValue: true,
                description: "Display service prices in the UI",
            },
            showDescriptions: {
                type: ControlType.Boolean,
                title: "Show Descriptions",
                defaultValue: true,
                description: "Display service descriptions",
            },
            showDuration: {
                type: ControlType.Boolean,
                title: "Show Duration",
                defaultValue: true,
                description: "Display service duration",
            },
            hideServiceSelectionWhenSingle: {
                type: ControlType.Boolean,
                title: "Hide Service Selection When Single",
                defaultValue: true,
                description:
                    "Automatically hide service dropdown when only one service is active",
            },
            showAPA: {
                type: ControlType.Boolean,
                title: "Show APA Prices",
                defaultValue: true,
                description:
                    "Display APA prices (useful for different business models)",
            },
            showPriceBreakdown: {
                type: ControlType.Boolean,
                title: "Show Price Breakdown",
                defaultValue: true,
                description:
                    "Show detailed breakdown (Base + APA = Total) vs just total price",
            },
            calendarView: {
                type: ControlType.Enum,
                title: "Calendar View",
                defaultValue: "month",
                options: ["month", "week"],
                optionTitles: ["Month View", "Week View"],
                description: "Display calendar as month or current week only",
            },
            showLegend: {
                type: ControlType.Boolean,
                title: "Show Legend",
                defaultValue: false,
                description: "Show color legend at bottom of calendar",
            },
            debugMode: {
                type: ControlType.Boolean,
                title: "Debug Mode",
                defaultValue: false,
                description: "Enable console logging for debugging",
            },
        },
    },
})
