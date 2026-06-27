require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const { MongoClient } = require('mongodb')

const client = new MongoClient(process.env.MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
})
let _db = null

async function connectDB() {
  await client.connect()
  _db = client.db('dead-sea-bnb')
  console.log('✓ MongoDB connected')
  await seedIfEmpty()
}

function db() {
  if (!_db) throw new Error('DB not connected')
  return _db
}

async function seedIfEmpty() {
  const count = await _db.collection('hosts').countDocuments()
  if (count > 0) return

  await _db.collection('hosts').insertOne({
    hostId: 'dead-sea-suite',
    username: 'nadav',
    name: 'נדב',
    password: 'nadav1234',
    hostingSince: 2022,
    pricePerNight: 820,
    cleaningFee: 150,
    maxGuests: 4,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    rating: 4.97,
    reviewCount: 14,
    amenities: ['wifi', 'ac', 'kitchen', 'parking', 'sea', 'view'],
    title: {
      he: 'סוויטה יוקרתית על חוף צפון ים המלח',
      en: 'Luxury suite on the shores of the northern Dead Sea',
    },
    location: {
      he: 'אזור עין גדי · ים המלח, ישראל',
      en: 'Ein Gedi region · Dead Sea, Israel',
    },
    locationNote: {
      he: 'צפון ים המלח · כ-90 דקות מתל אביב · כ-45 דקות מירושלים',
      en: 'Northern Dead Sea · ~90 min from Tel Aviv · ~45 min from Jerusalem',
    },
    about: {
      he: [
        'סוויטה פרטית על חוף צפון ים המלח — הנקודה הנמוכה ביותר בכדור הארץ. התעוררו לזריחה מעל מי המינרלים הנוצצים, בלו את היום צפים בקלות, וסיימו את הערב על המרפסת הפרטית בזמן שהמדבר מתקרר סביבכם.',
        'הסוויטה מצוידת במטבח מודרני, מיזוג אוויר ואמבטיה מרווחת עם אמבטיית ספא. מתאימה לזוגות או משפחות קטנות המחפשות מפלט יוצא דופן.',
      ],
      en: [
        'A private suite perched on the shores of the northern Dead Sea — the lowest point on Earth. Wake up to sunrise over glimmering mineral waters, spend your days floating effortlessly, and end your evenings on your private terrace as the desert cools around you.',
        'The suite is fully equipped with a modern kitchen, air conditioning, and a spacious bathroom with a soaking tub. Designed for couples or small families seeking an extraordinary retreat far from the everyday.',
      ],
    },
    rules: {
      he: [
        "צ'ק-אין אחרי 15:00, צ'ק-אאוט עד 11:00",
        'אסור לעשן בתוך הסוויטה',
        'חיות מחמד בתיאום מראש',
        'שקט בין 23:00 ל-08:00',
      ],
      en: [
        'Check-in after 15:00, check-out by 11:00',
        'No smoking inside the suite',
        'Pets allowed with prior approval',
        'Quiet hours 23:00 – 08:00',
      ],
    },
    images: [
      { label: { he: 'מרפסת עם נוף לים', en: 'Sea View Terrace' } },
      { label: { he: 'חדר שינה ראשי', en: 'Master Bedroom' } },
      { label: { he: 'סלון', en: 'Living Area' } },
      { label: { he: 'חדר אמבטיה', en: 'Private Bathroom' } },
      { label: { he: 'גינה וטרסה', en: 'Garden & Terrace' } },
    ],
    unavailableDates: [],
  })

  console.log('✓ Seeded initial host data')
}

module.exports = { connectDB, db }
