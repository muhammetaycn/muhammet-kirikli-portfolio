# Muhammet Kırıklı — kişisel portföy araştırması

23 Ekim 2026. Hedef, Muhammet Kırıklı’ın gerçek sistemlerini hareket ve etkileşimle anlatan kişisel bir site. Seçilen yaklaşım: güçlü bir tipografik açılış, özgün bir sistem sahnesi, dört somut proje ve doğrudan bağlantılar.

## Kaynaklar ve gözlem sınırı

İlk aşamada altı, revizyonda iki ek birincil kaynak incelendi. Metin/HTML gözlemleri, yayımlanmış CSS/JS kuralları ve tasarım kararları ayrı tutuldu. Araştırma sırasında kullanılabilir bir tarayıcı yüzeyi bulunmadığından referansların ekran görüntüsü, dokunmatik davranışı, animasyon akıcılığı, yükleme performansı ve azaltılmış hareket uygulaması test edilemedi. Kaynakta animasyon bulunması, mevcut cihazdaki çalışma kalitesinin ölçüldüğü anlamına gelmez.

| Kaynak | Doğrulanan gözlem | Sınır |
| --- | --- | --- |
| [Awwwards — interaktif portföy dizini](https://www.awwwards.com/websites/interactive-portfolio-examples/) | Dizin; portföy, proje sayfası, tipografi, etkileşim ve geçişleri ayrı keşif başlıkları olarak sunuyor. | Bir keşif ve sınıflandırma kaynağıdır. Muhammet Kırıklı’ın sitesi veya seçilen referanslar için ödül iddiası kurulmadı. |
| [Lusion](https://lusion.co/) | Sayfa metni, etkileşim/3B anlatım odağını ve seçili projeleri belirgin kuruyor; keşif, reel ve ses kontrolleri okunabiliyor. | Gerçek 3B sahne veya kaydırma davranışı çalıştırılarak doğrulanmadı. |
| [Bruno Simon](https://bruno-simon.com/) | Kontrol yönergeleri, harita/yeniden başlatma, ses ve kalite seçenekleri sayfa içeriğinde mevcut. Kişisel anlatı bir etkileşim metaforuyla sunuluyor. | Kontrollerin cihazda başarısı ve ölçülmüş performansı doğrulanmadı. |
| [Rauno Freiberg — Craft](https://rauno.me/craft) | Küçük etkileşim çalışmaları ayrı başlıklarla belgeleniyor. [Etkileşim yazısı](https://rauno.me/craft/interaction-design) kesilebilir hareket ve hızlı yanıtı tartışıyor. | Yazarın tasarım açıklaması, ana sayfanın tüm güncel davranışları için test sonucu değildir. |
| [Dennis Snellenberg](https://dennissnellenberg.com/) | Yayımlanmış [CSS](https://dennissnellenberg.com/assets/css/style-new.css) ve [JS](https://dennissnellenberg.com/assets/js/index-new.js) kaynaklarında büyük tipografi, kaydırmayla ilişkili başlık hareketi, proje önizlemeleri ve menü davranışları bulunuyor. | Kaynakta tanımlı/başlatılmış olmaları doğrulandı; görsel zamanlama ve mobil sonuç ölçülmedi. |
| [Carl Hauser — The Process](https://www.carlhauser.com/) | HTML ve yerleşim kuralları numaralı/tarihli bir arşiv, uyarlanan sütunlar ve kişisel kategoriler gösteriyor. | Bir hareket modülünün yüklenmesi belirli bir galeri veya hover efekti kanıtlamaz. |

## Altı ilkenin özgün tasarıma karşılığı

Bu kararlar kaynakların birebir düzenini veya kodunu yeniden üretmek için değil, Muhammet Kırıklı’ın içeriğine uygun bir deneyim kurmak için seçildi.

| İlke | Kaynakla bağlantısı | Muhammet Kırıklı için seçilen karşılık |
| --- | --- | --- |
| İçeriği açık sınıflandır | Awwwards’ın proje, tipografi ve etkileşimi ayrı başlıklarla ele alması | Dört gerçek sistem, kısa amaç cümlesi, kullanılan araçlar ve açık durum etiketi. |
| İlk ekranda tek bir güçlü fikir kur | Lusion’ın anlatım odağı ve proje keşfi | Muhammet Kırıklı adı etrafında özgün, sınırlı bir hareket sahnesi; okunabilir metin açılışta hazır kalır. |
| Etkileşimi hatırlanır ve isteğe bağlı yap | Bruno Simon’ın metaforu ve kontrol seçenekleri | Projeler arası bağı gösteren sistem haritası; aynı projeler normal listeden de açılır. Araba/dünya kurgusu kopyalanmaz. |
| Hareketle ilişkiyi anlat | Rauno’nun kesilebilir etkileşim ve katman yaklaşımı | Karttan ayrıntıya geçerken kaynağı anlaşılır kalan panel, görünür odak ve doğrudan geri dönüş. |
| Bölümlerin ritmini değiştir | Dennis’in tipografik açılış ve iş keşfi yapısı | Büyük kişisel başlık, ardından okunaklı proje satırları ve tek bir ayrıntı alanı; her bölümü aynı kart kalıbına sıkıştırmayan düzen. |
| Süreci somut içerikle göster | Carl’ın tarihli/numaralı kişisel arşivi | Doğrulanmış projeler, geliştirme/prototip durumları ve eklenebilecek gerçek deney notları; sahte faaliyet akışı kullanılmaz. |

## Özgün bileşenler ve hareket dili

- **Tipografik kişisel açılış:** Muhammet Kırıklı’ın kendi adı, kısa kişisel metin ve programatik çizilen bir alan. Harici marka kampanyası taşınmaz; kullanıcının isteğiyle Luci’yi yorumlayan kodla çizilmiş küçük bir SVG anlatıcı bulunur.
- **Projeleri bağlayan sistem haritası:** Her düğüm gerçek projeyi açar; aralarındaki bağlar arayüz, veri ve otomasyon kavramlarını anlatır. Bu, ürünlerin gerçek çalışma ekranı gibi etiketlenmez.
- **Proje satırları ve ayrıntı paneli:** Sorun, yaklaşım, üç özellik ve dört adımlı akış. Kaynakta doğrulanan içerik `content.js` içinde tutulur.
- **Ortak hareket kuralları:** Opaklık, dönüşüm ve kısa kırpılmış metin girişleri; kesilebilir panel geçişleri; ekran dışındayken duran dekoratif çizim. Normal kaydırma, klavye/dokunmatik karşılıkları ve azaltılmış hareket tercihi uygulamanın kontrol noktalarıdır.

Bu bileşenler özgün içerik ve geometriyle hazırlanır. Referans sitelerin ücretli fontları, görselleri, birebir başlıkları veya JavaScript kaynakları pakete kopyalanmadı. Görsel üretim çağrısı bu portföy çalışmasının parçası değildir.

## Proje içeriğinin dayanağı

Dört sistemin yerel kaynaklarında önce Graphify, ardından ilgili kod satırları incelendi. Metinler bu doğrulamaya dayanır. Etkinlik, içerik planlama ve topluluk botu **Geliştirme**; tekstil arayüzü **Prototip** olarak anlatılır. Tekstil sipariş akışı örnek veri ve yerel durum kullanır; e-irsaliye butonu gerçek entegrasyon kanıtı sayılmaz.

Canlı müşteri sayısı, performans puanı, çalışma süresi, tamamlanmış dağıtım, ödül veya doğrulanmamış repo bağlantısı eklenmedi. Proje akışlarını göstermek, genel uzmanlık iddialarından daha anlaşılır bir kanıt sağlar.


## Etkileşim revizyonu

[ToyFight](https://toyfight.co/) üzerindeki isteğe bağlı efekt kontrolleri ve [Olivier Larose](https://www.olivierlarose.com/) ile kendi [proje galerisi yazısı](https://blog.olivierlarose.com/tutorials/project-gallery-mouse-hover), kişisel kimliği ve eylem-sonuç ilişkisini güçlendirmek için ek kaynaklar oldu. Metin/kaynak gözlemleri kullanıldı; bu iki sitenin güncel hareketleri cihazda çalıştırılarak test edilmedi.

- Açılışın ana unsuru Muhammet Kırıklı adı oldu. Uzun slogan bandı kaldırıldı.
- Şerit, 96 düğümlü kapalı bir yay ağıyla bükülür. İmleç kütleyi ve yakındaki yüzeyi çeker; tutulan bölümde verilen biçim, dönüş sürerken korunur. Sıfırlama kontrolü vardır.
- Dört proje, kendi davranışlarını anlatan özgün küçük arayüz sahneleriyle önizlenir. Bunlar gerçek ürün ekran görüntüsü olarak sunulmaz.
- Takvime küçük bir Luci yorumu eklendi. Kodla çizilen karakter hücrelerin üstünde zıplar; terminal balonundaki proje temelli düşünceler yavaş yazılır ve kullanıcı tarafından ilerletilebilir. Karakter, Disenchantment’taki Luci’ye bir hayran çizimi yorumudur; site resmi bir bağlantı iddiası taşımaz.
- Üretim kayıtları ve karakterin bastığı hücreye verilen geçici vurgu ayrı tutulur. Etkinlik sayıları değiştirilmez.
- Görünürlük, hareket durdurma ve azaltılmış hareket tercihleri modülleri durdurur. Dokunmatik cihazlarda normal dikey kaydırma korunur.

Yerel önizlemede yüzeyden tutma/bükme, sıfırlama, sahne seçimi, terminal balonunu klavyeyle ilerletme ve genel durdurma davranışları doğrulandı. 390 px ve masaüstü genişliklerinde sayfa taşması kontrol edildi.


## LinkedIn içeriği ve kapsam

23 Ekim 2026’da [Muhammet Kırıklı’nın profili](https://www.linkedin.com/in/muhammet-kirikli/), [proje açıklamaları](https://www.linkedin.com/in/muhammet-kirikli/details/projects/) ve [65 yeteneği](https://www.linkedin.com/in/muhammet-kirikli/details/skills/) tarayıcıda okundu. Yalnız portföye dönük mesleki içerik kullanıldı. Özel analizler, bildirimler, bağlantı listeleri ve kariyer uzmanlarına özel tercihler portföye taşınmadı.

Tam ad ve LinkedIn birincil kimlik oldu. Yazılım, AI otomasyonu, sistem tasarımı, mobil ürünler, görsel iletişim ve tekstil deneyimi birlikte ele alındı. Dört seçili proje ve altı ek çalışma bulunur. LinkedIn’den alınan proje açıklamaları, kullanıcının profil beyanı olarak içerik kaynağıdır; hepsinin kodunun veya canlı dağıtımının ayrıca denetlendiği iddia edilmez. Önceden kodu incelenen projelerdeki prototip/geliştirme sınırları korundu. Bu portföyün kodla çizilen 3B sahnesi ve piksel anlatıcısı da çalışma olarak eklendi.

Luci, üst kenarda yürüyen bir süs yerine 52 × 7 matrisin tamamında iki boyutlu hareket eder. Her iniş, harf desenindeki bir hücreyi geçici renk katmanıyla işaretler. Beş renk sırayla devreye girer; yazım 3,4–7,8 saniye, okuma 2,4–3,5 saniye sürer. Eski kelime 1,6 saniyede arkadan silinirken yeni karakter girer. 896 proje temelli kısa düşünce ve bütün kelimeler kullanılır; aynı anda en fazla iki karakter görünür. Bu izler gerçek faaliyet kayıtlarına eklenmez.

## 24 Ekim / Nesne olarak portföy

[Alissa Wang’ın Discord karakter çalışması](https://alissawang.com/Discord) hem metin hem tarayıcıdaki hareketli karakter örnekleriyle incelendi. Alınan ilke, kısa squash/stretch hareketleri ve aynı karakter ailesinde tutarlı oranlardır. Marka rengi veya Wumpus çizimi kopyalanmadı. Bilgisayar, mevcut siyah–fildişi–turuncu paletle CSS hacimleri olarak kurulur; ekran ve 32 tuş gerçek DOM etkileşimleridir.

[Poolsuite](https://poolsuite.net/) tarayıcıda açılış ve masaüstü/pencere düzeni düzeyinde gözlendi. Referans, içerikle oynanabilen bir nesne hissidir; pembe palet, video, ses veya uygulama grafikleri alınmadı. [Bruno Simon’ın kendi açıklamasındaki](https://bruno-simon.com/) keşfedilebilir deneyim ilkesi, portföy içeriğine kısa ve doğrudan erişimle birleştirildi.

Şerit ve bilgisayar aynı açılış alanını sırayla paylaşır. İlk sahne 12, bilgisayar sahnesi 18 saniyedir; pointer, basılı tutma, klavye odağı ve açılmış ekran otomatik turu kilitler. Etkileşim bittikten sonra 14 saniye beklenir. Manuel seçim ve otomatik geçiş kontrolü her zaman bulunur. Azaltılmış harekette sahneler elle seçilir.

SQLite deneyi, [sql.js](https://github.com/sql-js/sql.js/releases/tag/v1.15.1) 1.15.1’in yerel WebAssembly dosyalarını gerektiğinde yükler. npm paket bütünlüğü SHA-512 ile doğrulanmıştır. Veritabanı bellektedir; gerçek sunucuya istek veya kalıcı veri kaydı iddiası yoktur. Paket lisansı ve kaynak kaydı `assets/vendor/sqljs/` içindedir.
