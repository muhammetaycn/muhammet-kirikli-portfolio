(function () {
  'use strict';

  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }

  window.PORTFOLIO = freeze({
  "identity": {
    "displayName": "Muhammet Kırıklı",
    "firstName": "Muhammet",
    "initials": "mk",
    "linkedin": "https://www.linkedin.com/in/muhammet-kirikli/",
    "github": "https://github.com/muhammetaycn"
  },
  "projects": [
    {
      "id": "idolog",
      "title": "IDOLOG — Sosyal platform",
      "short": "İçerik akışı, oturum ve moderasyon. Next.js ile FastAPI arasında geliştirdiğim sosyal ürün.",
      "category": "Full-stack ürün",
      "status": "Geliştirme",
      "stack": [
        "Next.js",
        "React",
        "Tailwind CSS",
        "Python",
        "FastAPI",
        "SQLite",
        "SQLAlchemy"
      ],
      "summary": "IDOLOG; ürün kararlarını, arayüzü ve servisleri birlikte geliştirdiğim sosyal platform.",
      "problem": "İçerik akışına oturum, moderasyon ve bildirim eklendiğinde her karar hem arayüzü hem servisi etkiliyor.",
      "solution": "Arayüz Next.js; servisler Python/FastAPI. Oturum, içerik ve moderasyonu aynı veri modeli ve kullanıcı akışı üzerinden geliştiriyorum.",
      "features": [
        "Ürün stratejisi, kullanıcı akışları ve marka / arayüz tasarımı",
        "Güvenli oturum, içerik moderasyonu ve bildirim akışları",
        "Kural tabanlı ajanlar; mobil görünüm, güvenlik ve veri bütünlüğü kontrolleri"
      ],
      "flow": [
        "Kullanıcı / oturum",
        "İçerik akışı",
        "Moderasyon / kurallar",
        "Bildirim / etkileşim"
      ],
      "scopeNote": "Ürün, arayüz ve servis katmanlarını birlikte geliştirdiğim sosyal platform çalışması.",
      "accent": "#FF6A35",
      "repo": null,
      "number": "01",
      "featured": true,
      "visual": "discussion"
    },
    {
      "id": "textile",
      "number": "02",
      "title": "TekstilOS — ERP ve üretim takibi",
      "short": "Ürün satırları, tutar ve üretim durumu aynı panoda. React/TypeScript ile arayüz prototipi.",
      "category": "Operasyon arayüzü",
      "status": "Prototip",
      "year": "2026",
      "stack": [
        "React",
        "TypeScript",
        "Vite",
        "Tailwind CSS",
        "Radix UI",
        "Recharts"
      ],
      "summary": "TekstilOS, sipariş ve üretim işlerini ekranda denediğim bir prototip.",
      "problem": "Siparişin ürün satırları, tutarı ve üretim durumu birlikte izlenmeli; stok ve kalite ekranları da aynı dili konuşmalı.",
      "solution": "Sipariş oluşturma, detay ve durum güncellemelerini React/TypeScript ile çalışan bir arayüz prototipinde deniyorum.",
      "features": [
        "Ürün satırları ve tutar hesabıyla sipariş oluşturma / düzenleme",
        "Sipariş detayını açma ve durumunu güncelleme",
        "Stok, kalite, bakım ve diğer alanlar için ortak modül düzeni"
      ],
      "flow": [
        "Sipariş formu",
        "Ürün satırları",
        "Yerel durum",
        "Sipariş panosu"
      ],
      "scopeNote": "Arayüz prototipi. Sipariş akışı örnek verilerle denenebiliyor; modüller geliştirmeye açık.",
      "accent": "#FF6A35",
      "repo": null,
      "featured": true,
      "visual": "textile"
    },
    {
      "id": "aciktinmi",
      "title": "Acıktınmı — Sosyal yemek haritası",
      "short": "Haritada mekân keşfi, yerel öneriler ve işletme panelleri. Kotlin ile Android prototipi.",
      "category": "Android / harita",
      "status": "Prototip",
      "stack": [
        "Kotlin",
        "Jetpack Compose",
        "Room",
        "Retrofit",
        "OkHttp",
        "Moshi",
        "Firebase Authentication"
      ],
      "summary": "Acıktınmı, yakındaki mekânı haritada bulmaktan işletme tarafına uzanan bir Android çalışması.",
      "problem": "Haritadaki nokta tek başına yetmiyor: mekân ayrıntısı, yerel öneri ve kullanıcı/işletme rolleri birbirine bağlanmalı.",
      "solution": "Kotlin ve Jetpack Compose arayüzü; Room ile yerel veri, Retrofit/OkHttp ile servis katmanı, Firebase ile kimlik doğrulama.",
      "features": [
        "Sosyal harita, keşif akışı, mekân detayları ve yerel öneriler",
        "Kullanıcı, işletme ve yönetici panelleri; işletme başvurusu ve Askıda Yemek akışları",
        "Yerel veri, kimlik doğrulama, AI entegrasyonları ve otomatik veri kürasyonu"
      ],
      "flow": [
        "Haritada keşif",
        "Mekân detayları",
        "Sosyal / yerel öneri",
        "Kullanıcı / işletme paneli"
      ],
      "scopeNote": "Android uygulama prototipi; mobil deneyim, veri akışı ve işletme süreçlerini birlikte ele alıyor.",
      "accent": "#FF6A35",
      "repo": null,
      "number": "03",
      "featured": true,
      "visual": "mobile"
    },
    {
      "id": "portfolio",
      "title": "Motion portföyü",
      "short": "Şeridi bük, bir tuşa bas, komut çalıştır. Arayüz ile hareketi denediğim açık kaynak çalışma alanı.",
      "category": "Creative development",
      "status": "Geliştirme",
      "year": "2026",
      "stack": [
        "JavaScript",
        "HTML",
        "CSS",
        "Canvas 2D",
        "SVG",
        "requestAnimationFrame",
        "SQLite / WebAssembly"
      ],
      "summary": "Bu portföyün kendisi de bir proje: şekil verilebilen yüzey, 32 tuşlu bilgisayar, tarayıcıda çalışan uygulamalar ve Luci matrisi.",
      "problem": "Aynı sayfada 3B hissi, klavye uygulamaları ve karakter animasyonu var. Etkileşimler birbirini kesmeden, okunur ve durdurulabilir kalmalı.",
      "solution": "Canvas şeridi, CSS bilgisayarı ve SVG karakterleri ortak hareket kontrolüne bağladım; SQLite, terminal ve küçük deneyler tarayıcı içinde çalışıyor.",
      "features": [
        "Üç biçim arasında dönüşen, dönmeye devam ederken tutup bükülebilen etkileşimli yüzey",
        "32 boş tuş: terminal, SQLite sorguları, transaction, uygulama akışları, motion araçları ve mini oyunlar",
        "Dikişli eldiven imleci, etkileşime uzanan siyah lifler ve 52 × 7 hücreye yazan Luciler"
      ],
      "flow": [
        "Dokun / şekil ver",
        "Projeyi keşfet",
        "Sistemi çalıştır",
        "Üretim izlerini izle"
      ],
      "scopeNote": "HTML, CSS ve JavaScript ile geliştirilen; hareketi durdurma ve azaltılmış hareket tercihlerini destekleyen bu portföy.",
      "accent": "#FF6A35",
      "repo": null,
      "number": "04",
      "featured": true,
      "visual": "portfolio"
    },
    {
      "id": "event",
      "number": "05",
      "title": "Canlı Etkinlik Sistemi",
      "short": "Telefondaki fotoğraf, yönetim onayından sonra sahnede. QR katılımı ve canlı soru araçları.",
      "category": "Canlı deneyim",
      "status": "Geliştirme",
      "year": "2026",
      "stack": [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Supabase",
        "Sharp"
      ],
      "summary": "Katılımcının telefonuyla salondaki ekran arasında fotoğraf, soru ve sahne yönetimi geliştiriyorum.",
      "problem": "Yüklenen fotoğraf sahneye ulaşmadan önce onaylanmalı; canlı soru ve duyurular da salondaki deneyimle eşleşmeli.",
      "solution": "QR/kod katılımı, fotoğraf yükleme ve yönetim onayından sonra sahne galerisi. Canlı soru, duyuru ve karaoke için ayrı yönetim adımları.",
      "features": [
        "QR veya kodla katılım erişimi ve fotoğraf yükleme",
        "Fotoğraf onayı, galeri ve beğeni akışı",
        "Canlı soru, duyuru ve karaoke için sahne yönetimi"
      ],
      "flow": [
        "QR ile katılım",
        "Fotoğraf yükleme",
        "Yönetim / onay",
        "Canlı sahne / galeri"
      ],
      "scopeNote": "Katılım, galeri ve sahne yönetimini bir araya getiren geliştirme sürümü.",
      "accent": "#FF6A35",
      "repo": null,
      "featured": false,
      "visual": "event"
    },
    {
      "id": "gorgez",
      "title": "GÖRGEZ — Doğa ve rota keşfi",
      "short": "Doğa rotaları için veri toplama, koordinat kontrolü ve mobil harita. Python ile React Native arasında bir keşif ürünü.",
      "category": "Mobil / veri sistemi",
      "status": "Prototip",
      "stack": [
        "Expo",
        "React Native",
        "react-native-maps",
        "Python",
        "FastAPI",
        "SQLAlchemy",
        "Playwright",
        "BeautifulSoup"
      ],
      "summary": "GÖRGEZ üzerinde doğal yerlerin kaynak verisinden mobil haritadaki görünümüne kadar çalışıyorum.",
      "problem": "Yer adı, koordinat ve fotoğraf farklı gezi kaynaklarından geliyor. Haritaya girmeden önce kayıtlar temizlenip doğrulanmalı.",
      "solution": "Python ajanlarıyla kaynak tarama ve koordinat doğrulama; API üzerinden Expo/React Native haritasına giden sınıflandırılmış kayıtlar.",
      "features": [
        "Yer, kategori, fotoğraf ve tarama kayıtları için API katmanı",
        "Wikipedia, harita ve gezi kaynakları için Playwright / BeautifulSoup tarama ajanları",
        "Koordinat doğrulama, kategori eşleme, tekrar kayıt önleme ve görev kuyruğu"
      ],
      "flow": [
        "Kaynak taraması",
        "Temizleme / doğrulama",
        "Yer / kategori API",
        "Mobil harita / rota"
      ],
      "scopeNote": "Mobil uygulama ve backend prototipi; keşif arayüzüyle veri toplama sistemini birlikte geliştiriyorum.",
      "accent": "#FF6A35",
      "repo": null,
      "number": "06",
      "featured": false,
      "visual": "gorgez"
    },
    {
      "id": "content",
      "number": "07",
      "title": "IDOLOG — İçerik otomasyonu",
      "short": "Araştırma notu, taslak ve tarihli yayın kuyruğu. IDOLOG için içerik çalışma alanı.",
      "category": "İş akışı otomasyonu",
      "status": "Geliştirme",
      "year": "2026",
      "stack": [
        "Next.js",
        "React",
        "Node.js",
        "SQLite",
        "node-cron",
        "Tailwind CSS"
      ],
      "summary": "Bir konu notunun taslağa ve tarihli gönderiye dönüşmesini takip eden içerik otomasyonu.",
      "problem": "Bir araştırma notunun taslak mı, hazır mı, sırada mı olduğunu ve yayın tarihini görünür tutmak gerekiyor.",
      "solution": "Konu özeti, taslak, tarihli gönderi kaydı ve kuyruk durumu aynı çalışma alanında takip ediliyor.",
      "features": [
        "Araştırma konusu özetinden içerik taslağı oluşturma",
        "Platform ve tarih seçerek gönderi zamanlama",
        "Gönderi kuyruğunu ve yayın programlarını panelden takip etme"
      ],
      "flow": [
        "Araştırma",
        "Taslak",
        "Zamanlama",
        "Yayın kuyruğu"
      ],
      "scopeNote": "Araştırma, taslak ve zamanlamayı tek akışta topladığım geliştirme sürümü.",
      "accent": "#FF6A35",
      "repo": null,
      "featured": false,
      "visual": "content"
    },
    {
      "id": "paulukizlar",
      "title": "Paulukızlar — Öğrenci platformu",
      "short": "PAÜ ve Denizli öğrencileri için ilan, rehber, soru-cevap ve mesajlaşma üzerine web ürünü.",
      "category": "Web / topluluk ürünü",
      "status": "Geliştirme",
      "stack": [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "PostgreSQL",
        "Supabase",
        "Zod"
      ],
      "summary": "Paulukızlar; kampüs bilgisini, öğrenci ilanlarını ve soru-cevap alanını bir web ürününde ele aldığım çalışma.",
      "problem": "İlanın sahibi, sorunun konusu ve içeriğin görünürlüğü aynı sistemde takip edilebilmeli.",
      "solution": "İlan, rehber, soru-cevap ve mesajlaşmayı ilişkisel veri, kullanıcı rolleri ve moderasyon kontrolleriyle geliştiriyorum.",
      "features": [
        "İlan, rehber, soru-cevap, kampüs / mekân keşfi ve mesajlaşma akışları",
        "Magic link oturumu; rol, sahiplik ve satır düzeyinde erişim kuralları",
        "Repository mimarisi, Zod doğrulaması, moderasyon, denetim kaydı ve hız sınırı"
      ],
      "flow": [
        "Öğrenci / oturum",
        "İçerik oluşturma",
        "Rol / sahiplik kontrolü",
        "Keşif / mesajlaşma"
      ],
      "scopeNote": "Ürün akışları, ilişkisel veri yapısı ve güvenlik kontrolleri üzerinde geliştirdiğim öğrenci platformu.",
      "accent": "#FF6A35",
      "repo": null,
      "number": "08",
      "featured": false,
      "visual": "paulukizlar"
    },
    {
      "id": "dm",
      "title": "DM Operatörü",
      "short": "Yanıt metninden önce hedefi ve bağlamı kontrol eden yorum/DM otomasyonu denemesi.",
      "category": "AI / süreç otomasyonu",
      "status": "Prototip",
      "stack": [
        "Python",
        "Playwright",
        "Durum makinesi",
        "AI görev akışı",
        "Denetim kayıtları"
      ],
      "summary": "Instagram yorum ve mesaj sorularında, yanıtın içeriğini ve hedefini birlikte kontrol eden bir otomasyon deniyorum.",
      "problem": "Otomatik yanıtta doğru metin yeterli değil. Yanlış hedef ve tekrar gönderim, kullanıcıya doğrudan yansıyor.",
      "solution": "Yeni iletiyi izin ve bağlam kontrolünden geçiriyorum. AI çıktısı ayrıştırılıyor; hedef yeniden doğrulanmadan gönderim adımı ilerlemiyor.",
      "features": [
        "İzinli kullanıcı doğrulaması, yorum / DM sınıflaması ve bağlam toplama",
        "ChatGPT proje oturumuna görev aktarımı ve tamamlanmış yanıtı ayıklama",
        "Hedefi yeniden doğrulama, tekrar gönderim kontrolü ve denetim kaydı"
      ],
      "flow": [
        "İleti / izin kontrolü",
        "Bağlam / sınıflama",
        "AI görev / yanıt",
        "Hedef / gönderim kontrolü"
      ],
      "scopeNote": "Python ve Playwright ile geliştirdiğim kontrollü otomasyon denemesi.",
      "accent": "#FF6A35",
      "repo": null,
      "number": "09",
      "featured": false,
      "visual": "dm"
    },
    {
      "id": "community",
      "number": "10",
      "title": "Topluluk Botu",
      "short": "Etiket değiştiğinde rolü güncelleyen; komut, sayaç ve yardım panellerini yöneten topluluk botu.",
      "category": "Topluluk araçları",
      "status": "Geliştirme",
      "year": "2026",
      "stack": [
        "Node.js",
        "JavaScript",
        "discord.js",
        "@discordjs/voice",
        "Sharp"
      ],
      "summary": "Üye etkileşimleri ve günlük yönetim işleri için komutlar, paneller ve etiket–rol eşleşmeleri geliştiriyorum.",
      "problem": "Etiket değişimi, rol eşleşmesi ve yönetim komutları aynı üyeyi etkiliyor; kuralların nerede uygulandığı açık olmalı.",
      "solution": "Komutları ortak bir yönlendirme katmanında topluyor; etiket–rol eşleşmesini, sayaçları ve yardım panellerini aynı botta yönetiyorum.",
      "features": [
        "Slash komutlarıyla etiket sayacı ve özellik rehberi",
        "Etiket durumuna göre yapılandırılabilir rol ekleme / geri alma",
        "Yönetim panelinden rol ayarları ve toplu eşleme"
      ],
      "flow": [
        "Üye etkileşimi",
        "Komut yönlendirme",
        "Etiket / rol eşleme",
        "Panel / rol yanıtı"
      ],
      "scopeNote": "Komut, panel ve etiket rolü akışlarını geliştirdiğim topluluk aracı.",
      "accent": "#FF6A35",
      "repo": null,
      "featured": false,
      "visual": "community"
    }
  ],
  "capabilities": [
    {
      "title": "Full-stack yazılım",
      "description": "Kullanıcı akışından arayüze, API’den veritabanına kadar bir ürünün katmanlarını birlikte geliştiriyorum.",
      "tools": [
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "Python",
        "FastAPI",
        "Tailwind CSS"
      ]
    },
    {
      "title": "AI ve iş akışı otomasyonu",
      "description": "Araştırma, veri toplama, içerik ve görev kuyruklarını; bağlamı ve kontrol noktalarını kaybetmeden birbirine bağlıyorum.",
      "tools": [
        "Prompt Engineering",
        "Playwright",
        "Web Scraping",
        "Python",
        "AI ajanları",
        "Süreç otomasyonu"
      ]
    },
    {
      "title": "Sistem ve veri tasarımı",
      "description": "Bir ekrandaki eylemin hangi kurala, kayda ve sonuca bağlandığını tasarlıyorum. Oturum, rol ve veri bütünlüğü bu akışın parçası.",
      "tools": [
        "PostgreSQL",
        "Supabase",
        "SQLite",
        "SQLAlchemy",
        "API tasarımı",
        "Sistem analizi"
      ]
    },
    {
      "title": "Mobil ürünler",
      "description": "Harita, yerel veri ve servis akışlarını Android ve React Native arayüzlerinde buluşturuyorum.",
      "tools": [
        "Kotlin",
        "Jetpack Compose",
        "Android",
        "React Native",
        "Expo",
        "Room",
        "Harita arayüzleri"
      ]
    },
    {
      "title": "Etkileşim ve motion",
      "description": "Tıklamayı, sürüklemeyi ve geçişleri deneyimin bir parçası olarak kuruyorum. Bu portföydeki yüzey ve anlatıcı da bunun bir denemesi.",
      "tools": [
        "JavaScript",
        "HTML",
        "CSS",
        "Canvas 2D",
        "SVG",
        "requestAnimationFrame",
        "Kullanıcı deneyimi"
      ]
    },
    {
      "title": "Görsel tasarım ve video",
      "description": "Marka dili, grafik, illüstrasyon ve video düzenlemeyi ürünün kendini nasıl anlattığıyla birlikte düşünüyorum.",
      "tools": [
        "Photoshop",
        "Illustrator",
        "InDesign",
        "Lightroom",
        "Video düzenleme",
        "Görsel iletişim"
      ]
    },
    {
      "title": "Tekstil ve üretim süreçleri",
      "description": "Baskı, varyant, boyama ve kalite süreçlerinden gelen saha deneyimini üretim takibi ve ERP arayüzlerine taşıyorum.",
      "tools": [
        "Tekstil baskı",
        "Tekstil boyama",
        "Varyant",
        "Kalite kontrol",
        "Üretim planlama",
        "ERP"
      ]
    },
    {
      "title": "Ürün ve süreç geliştirme",
      "description": "İhtiyacı analiz edip kullanıcı akışını, iş planını ve geliştirme adımlarını aynı çerçevede ele alıyorum.",
      "tools": [
        "Ürün geliştirme",
        "İş analizi",
        "Proje yönetimi",
        "Stratejik planlama",
        "İçerik yönetimi",
        "Topluluk yönetimi"
      ]
    }
  ],
  "contacts": [
    {
      "label": "LinkedIn",
      "value": "Muhammet Kırıklı",
      "href": "https://www.linkedin.com/in/muhammet-kirikli/"
    },
    {
      "label": "GitHub",
      "value": "muhammetaycn",
      "href": "https://github.com/muhammetaycn"
    }
  ],
  "profileSource": "https://www.linkedin.com/in/muhammet-kirikli/",
  "linkedinSkills": [
    "İş Planı",
    "Yapay Zeka",
    "Prompt Engineering",
    "Ürün Geliştirme",
    "Yazılım Geliştirme",
    "ERP (Kurumsal Kaynak Planlaması)",
    "Yapay Zeka Otomasyonu",
    "Full-Stack Geliştirme",
    "Sistem Tasarımı",
    "React Native",
    "Web Scraping",
    "Playwright",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "Jetpack Compose",
    "Android Geliştirme",
    "Mobil Uygulama Geliştirme",
    "Kotlin",
    "Sistem Analizi",
    "Süreç Otomasyonu",
    "Üretim Planlama",
    "Üretim Takibi",
    "Bilgi Sistemleri",
    "Üretim Yönetimi",
    "Tekstil Ürün Geliştirme",
    "İş Akışı Otomasyonu",
    "Uygulama Geliştirme",
    "SaaS Geliştirme",
    "Veritabanı Geliştirme",
    "Web Geliştirme",
    "İş Analizi",
    "Stratejik Planlama",
    "Proje Yönetimi",
    "Kullanıcı Deneyimi",
    "Görsel İletişim",
    "Tekstil Endüstrisi",
    "Adobe Creative Suite",
    "Tekstil Terbiyesi",
    "Tekstil Boyama",
    "Tekstil Baskı",
    "Kalite Kontrol",
    "SQLAlchemy",
    "SQLite",
    "Tailwind CSS",
    "FastAPI",
    "React.js",
    "Python",
    "Next.js",
    "Sosyal Medya",
    "Tekstil",
    "Tekstil Tasarımı",
    "Video Düzenleme",
    "Dijital Resimlendirme",
    "Ekip Çalışması",
    "Sorun Çözme",
    "Dijital Pazarlama",
    "İçerik Yönetimi",
    "InDesign",
    "Grafik Tasarımı",
    "Lightroom",
    "Videografi",
    "Resimlendirici",
    "Photoshop",
    "İllüstrasyon"
  ],
  "experience": [
    {
      "organization": "Bağımsız ürün ve sistem çalışmaları",
      "role": "Yazılım · AI otomasyonu · Tasarım",
      "duration": "Devam eden projeler",
      "description": "Web ve mobil ürünler, AI otomasyonları, arayüzler ve etkileşimli deneyimler. IDOLOG, Acıktınmı, GÖRGEZ ve diğer projelerde ürün, yazılım ve tasarım katmanlarını birlikte ele alıyorum."
    },
    {
      "organization": "Altınbaşak Tekstil",
      "role": "Baskı üretimi",
      "duration": "11 ay",
      "description": "Tekstil baskı üretiminde saha deneyimi."
    },
    {
      "organization": "Uğurlu Baskı / Halmer",
      "role": "Varyant",
      "description": "Tekstil baskı ve varyant süreçlerinde çalışma deneyimi."
    },
    {
      "organization": "Poyraz Boya Apre · Rateks · Atlas · Aslı",
      "role": "Staj deneyimleri",
      "description": "Tekstil üretim süreçlerini farklı işletmelerde tanıdığım stajlar."
    }
  ],
  "education": [
    {
      "institution": "Pamukkale Üniversitesi",
      "program": "Tekstil Teknolojisi · Ön Lisans",
      "dates": "Ağustos 2024 — Temmuz 2026"
    },
    {
      "institution": "DOSTEK Koleji",
      "program": "Mesleki ve Teknik Eğitim · Tekstil Alanı",
      "dates": "Haziran 2022"
    }
  ]
});
})();
