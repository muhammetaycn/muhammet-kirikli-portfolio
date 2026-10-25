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
- Matrise küçük Luci yorumları eklendi. Kodla çizilen karakterler hücrelerin üstünde zıplar; terminal balonlarındaki teknik diyaloglar yavaş yazılır ve kullanıcı tarafından sıraya alınabilir. Karakter, Disenchantment’taki Luci’ye bir hayran çizimi yorumudur; site resmi bir bağlantı iddiası taşımaz.
- Üretim kayıtları ve karakterin bastığı hücreye verilen geçici vurgu ayrı tutulur. Etkinlik sayıları değiştirilmez.
- Görünürlük, hareket durdurma ve azaltılmış hareket tercihleri modülleri durdurur. Dokunmatik cihazlarda normal dikey kaydırma korunur.

Yerel önizlemede yüzeyden tutma/bükme, sıfırlama, sahne seçimi, terminal balonunu klavyeyle ilerletme ve genel durdurma davranışları doğrulandı. 390 px ve masaüstü genişliklerinde sayfa taşması kontrol edildi.


## LinkedIn içeriği ve kapsam

23 Ekim 2026’da [Muhammet Kırıklı’nın profili](https://www.linkedin.com/in/muhammet-kirikli/), [proje açıklamaları](https://www.linkedin.com/in/muhammet-kirikli/details/projects/) ve [65 yeteneği](https://www.linkedin.com/in/muhammet-kirikli/details/skills/) tarayıcıda okundu. Yalnız portföye dönük mesleki içerik kullanıldı. Özel analizler, bildirimler, bağlantı listeleri ve kariyer uzmanlarına özel tercihler portföye taşınmadı.

Tam ad ve LinkedIn birincil kimlik oldu. Yazılım, AI otomasyonu, sistem tasarımı, mobil ürünler, görsel iletişim ve tekstil deneyimi birlikte ele alındı. Dört seçili proje ve altı ek çalışma bulunur. LinkedIn’den alınan proje açıklamaları, kullanıcının profil beyanı olarak içerik kaynağıdır; hepsinin kodunun veya canlı dağıtımının ayrıca denetlendiği iddia edilmez. Önceden kodu incelenen projelerdeki prototip/geliştirme sınırları korundu. Bu portföyün kodla çizilen 3B sahnesi ve piksel anlatıcısı da çalışma olarak eklendi.

52 × 7 matris ortak bir sahnedir. Siyah Luci kimliğini korur; ikinci yazar cyan, turkuaz, kehribar, coral ve pembe syntax tonlarıyla değişir. Yazım sınırı her EN/TR çiftinde kayar, yazarlar dört turda bir taraf değiştirir. İki kelime arasında okuma için iki sütun bırakılır; bu boşluk da yer değiştirir. Sahne bankası boyunca 364 hücrenin tamamı kullanılır. Aynı anda en fazla üç karakter görünür. İkinci yazar 900 ms sonra başlar; ikisi de kendi kelimesini tamamlar. Tam kelime en az 4,2 saniye, tamamen yazılmış düşünce en az 5 saniye okunur. Sonraki yazım, önceki kelimenin 1,6 saniyelik silinmesiyle örtüşür; hücre kilidi yazı çarpışmasını önler.

96 teknik konu, dönüşümlü EN/TR 192 sahne ve 384 özgün kısa düşünce içerir. İsim ve tekstil metinleri yoktur; sorgular, durum, asenkron işler, hata kodları ve küçük kod satırları gösterilir. Yaklaşık her beş kelimede bir yanlış iniş, üç kırmızı iz, WARN/RECOVER ve tek hafif panel kırılması oluşur. Gerçek etkinlik verileri değişmez. Balona basmak sonraki düşünceyi güvenli kuyruğa alır. Görünmeyen veya duraklatılmış sayfada süre ilerlemez; azaltılmış harekette sabit okunur durum gösterilir.

## 24 Ekim / Nesne olarak portföy

[Alissa Wang’ın Discord karakter çalışması](https://alissawang.com/Discord) hem metin hem tarayıcıdaki hareketli karakter örnekleriyle incelendi. Alınan ilke, kısa squash/stretch hareketleri ve aynı karakter ailesinde tutarlı oranlardır. Marka rengi veya Wumpus çizimi kopyalanmadı. Bilgisayar, mevcut siyah–fildişi–turuncu paletle CSS hacimleri olarak kurulur; ekran ve 32 tuş gerçek DOM etkileşimleridir.

[Poolsuite](https://poolsuite.net/) tarayıcıda açılış ve masaüstü/pencere düzeni düzeyinde gözlendi. Referans, içerikle oynanabilen bir nesne hissidir; pembe palet, video, ses veya uygulama grafikleri alınmadı. [Bruno Simon’ın kendi açıklamasındaki](https://bruno-simon.com/) keşfedilebilir deneyim ilkesi, portföy içeriğine kısa ve doğrudan erişimle birleştirildi.

Şerit ve bilgisayar aynı açılış alanını sırayla paylaşır. İlk sahne 12, bilgisayar sahnesi 18 saniyedir; pointer, basılı tutma, klavye odağı ve açılmış ekran otomatik turu kilitler. Etkileşim bittikten sonra 14 saniye beklenir. Manuel seçim ve otomatik geçiş kontrolü her zaman bulunur. Azaltılmış harekette sahneler elle seçilir.

SQLite deneyi, [sql.js](https://github.com/sql-js/sql.js/releases/tag/v1.15.1) 1.15.1’in yerel WebAssembly dosyalarını gerektiğinde yükler. npm paket bütünlüğü SHA-512 ile doğrulanmıştır. Veritabanı bellektedir; gerçek sunucuya istek veya kalıcı veri kaydı iddiası yoktur. Paket lisansı ve kaynak kaydı `assets/vendor/sqljs/` içindedir.


## 24 Ekim / Birlikte yazım ve hata dili

İki yazarın başlangıcı ve çizim saatleri ayrı, konu geçişi birlikte planlandı. Metin okuma süresi hücre atlama hızından bağımsız tutulur. Dar panel ve sabit balonlar gözün sürekli yer değiştirmesini azaltır. Yanlış iniş gerçek üretim verisine eklenmez; kırmızı iz ve panelde tek yumuşak sıçrama, ardından toparlanma gösterilir.

Hata kodlarının anlamı [Node.js’in hata belgeleri](https://nodejs.org/api/errors.html#common-system-errors) ve [MDN HTTP 429 açıklaması](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429) ile kontrol edildi. Balondaki kısa cümleler ve kod parçaları bu deney için yazılmıştır; gerçek bir sunucudan alınmış hata kaydı olarak sunulmaz.

## 24 Ekim / Eldiven ve simbiyot dokusu

Tek noktadan çıkan paralel çizgiler, üç eldiven köküne bağlı üç incelen gövde ve altı dala dönüştürüldü. İnce zarlar, eldivene yayılan siyah damarlar, yayla geciken eğriler ve basma dalgası aynı malzeme hissini kurar. En fazla iki bağlantı vardır. Son revizyonda el yaklaşık %30 küçültüldü; yeni hedef 150 px, tutunmuş hedef 216 px sınırı ve 580 ms geri çekilme kullanır. Bunlar uygulamanın tasarım kararlarıdır.

- [MDN PointerEvent](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent): cihaz türü ayrımı, dokunmada normal kontrolü korumak için kullanılır. Metin alanları ve klavye gezinmesi de özel imleci bırakır; katman tıklama olaylarını yakalamaz.
- [MDN SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox): SVG koordinatlarının görüntü alanına eşlenmesi esas alınır. Eldivenin CSS alanı ve viewBox ölçüsü eşit tutularak parmak ucu gerçek tıklama noktasına yerleştirilir.
- [MDN Document.elementFromPoint](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint): hedefin yalnız yerleşim kutusu değil, temas noktasında gerçekten görünmesi kontrol edilir. Üstü örtülen hedef bırakılır. Başlangıç kenarı dışarıdaki baskın eksenden seçilir; bağlantı sırasında kilitlenerek köşelerde sıçraması önlenir.
- [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame): zaman damgasıyla ilerleme ve gerektiğinde yeni kare isteme kullanılır. Serbest imleç sakinleşince döngü durur; ilgisiz metin/piksel değişimleri yeniden başlatmaz. Gizlenme, duraklatma ve azaltılmış hareket çizimi kapatır; etkin dialog imlecin yeni katmanı olur.

Yerel davranış testlerindeki 19 grup; geometriyi, dal sayısını, temas yönünü, örtülmeyi, gerilme/geri çekilme süresini, hedef değiştirmeyi ve temizlemeyi doğruladı. Bu kontroller cihazlar arası bir FPS veya CPU ölçümü değildir.

## 24 Ekim / Ölçek ve ortak sahne revizyonu

Elin küçük ölçüsünde basma esnemesi dört ondalıklı aynı dönüşümle hem çizime hem ağ köklerine uygulanır. Yay adımları bölünür, hareket yumuşatması geçen süreye bağlıdır. Kopan altı dal temas noktalarını aynı anda dondurur; yeniden tutunmada uç 180 ms boyunca birleştirilir. Butonun temas kenarındaki kabarma ve basma dalgası SVG katmanındadır; gerçek kontrolün tıklama alanı değişmez.

Luci'lerin sabit iki yarısı, yer değiştiren yazım alanlarına çevrildi. Okuma aralığı iki sütundur ve her konu çiftinde kayar; rota kontrolü 52 sütunun ve 364 hücrenin tamamının sahne bankasında kullanıldığını doğrular. Dört turda bir taraf değişimi 700 ms sıçramayla gösterilir. Mobil terminal metni 12 px'e, başlık bilgileri en az 8 px'e çıkarıldı; sözcükler dar alanda satır kırabilir. Proje ayrıntılarındaki kalan morumsu metinler sıcak fildişi tonlarıyla değiştirildi.
## 24 Ekim / İzlemekten denemeye

İlk bilgisayar turundaki sabit imleç hareketi, uygulama düğmelerinin gerçek yerel koordinatlarını izleyen bir akışla değiştirildi: Terminal'de `projects`, SQLite'ta JOIN, ardından Sürümler'de v0.3 ilişki şeması. Kullanıcı girişi turu keser; geciken sorgular kullanıcının devraldığı ekranı değiştiremez. Uyanış, düşünce okuma süresi ve tuş tepkileri görünür sahne saatiyle ilerler.

Sistemler bölümü yedi yerel deneye ayrıldı. Girdi düzenlenir, doğrulanır, onay noktasında durur ve ancak onaydan sonra yerel kayıt oluşur. Aynı veri yeniden kaydedilmez. SVG düğümleri klavyeyle seçilebilir; aynı verinin JSON biçimi ve sınırlı işlem izi görünür. Yetenek haritası da sekiz alanı ilgili proje ayrıntılarına bağlar.

384 kısa düşünce için konu bankası genişletildi. Eşleşen EN/TR konuları döngü içinde tekrarlanmaz; yeni döngüde sıra karışır. Teknik anlamlar için [MDN önbellekleme](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching), [SQLite WAL](https://sqlite.org/wal.html), [performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) ve [Node.js akışları](https://nodejs.org/api/stream.html) kontrol edildi.

Kullanıcının 50,7 saniyelik video referansından altı farklı anın yerel kareleri incelendi. Küçük kişisel paneller, iz bırakma ve keşif katmanları dikkate alındı; hesap, ziyaretçi veya dinleme verisi kopyalanmadı. Bu sitedeki geliştirme izi, kendi Git geçmişinden üretilen tarihli commit bağlantılarıdır. AI hesabı kullanım analitiği değildir.

## 24 Ekim / Ayrı video incelemesi ve proje galerisi

Bu turda yerel `2026-10-22 17-13-29.mp4` dosyasının 50,7 saniyelik akışı, 21 farklı zamanın tam çözünürlüklü kareleriyle incelendi. Önceki altı karelik bakış genişletildi; aşağıdaki zamanlar doğrudan görülen yapıları belirtir. Karelerden easing süreleri, sesin çalması, sunucu mimarisi veya cihaz performansı çıkarılmadı.

| Zaman | Videoda doğrudan görülen yapı |
| --- | --- |
| 00–06 sn | Solda banner/avatar, ad, konum/saat, kısa biyografi ve bağlantılar; sağda Spotify OFFLINE ve Current Project panelleri. |
| 00–49 sn | Altta ortalanmış altı ikonlu sabit Dock, ayrı sosyal ikonlar; açık pencerenin arkasında bulanmış gezinme. |
| 09 ve 43 sn | Büyük ön kapak ve iki yanda eğilen/küçülen kapaklarla perspektifli müzik karuseli. |
| 11 ve 16 sn | Dört parçalı geri sayım, Guestbook açma kartı ve yatay konumu değişen iki teknoloji logosu satırı. Geri sayımın hedefi doğrulanamıyor. |
| 14 sn | Functional, Third party media, Sound effects ve Visual effects seçenekli ayar penceresi. |
| 20–28 sn | Mesajlar/Yaz sekmeleri, arama, mesaj kartları, emoji ve değişen kalp sayıları; 26 sn'de parola alanlı Admin access alt penceresi. |
| 31–36 sn | Avatar seçimi, ad ve 280 karakterlik mesaj alanı; Undo/Clear kontrollü imza pedi ve artan mavi çizgiler. |
| 37–40 sn | Gönderim bildirimi, artan mesaj sayısı, yeni Hello kartı ve çizimin kart içindeki küçük önizlemesi. |

Video, küçük modüllü bir kişisel alan referansıdır. Bu portföydeki `PersonalDock`, sabit bölüm bağlantılarını ve kompakt profil panelini bu gözleme göre yorumlar: Muhammet Kırıklı kimliği, gerçek proje/yetenek sayıları, İstanbul saati ve doğrulanmış kaynak depoya ait GitHub geliştirme izi. Başkasının avatarı, müzik geçmişi, katkı veya ziyaretçi sayısı alınmadı. Videodaki ziyaretçi defteri, kalıcı ortak servis veya güvenli yönetim akışı uygulandığının kanıtı sayılmaz; bu sürüm böyle bir hizmet sunmuş olarak belgelenmez.

Ayrıca [Awwwards ana sayfası](https://www.awwwards.com/) bu turda tarayıcıda görsel olarak gezildi: büyük tipografi, öne çıkan Brandon Yasin çalışmasının geniş proje kartı ve alttaki kategori Dock'u gözlendi. Aynı galeriden açılan [Brandon Yasin](https://brandonyasin.com/) örneğinde yatay fotoğraflı büyük proje kapakları, küçük kalıcı gezinme ve yerel saat görüldü; bir projeye basılınca büyük görsel, başlık ve meta bilgileri olan ayrıntı sayfası açıldı. Bu, kullanıcının ekran görüntüsünün kaynağı olarak doğrulanmış değildir.

`ProjectMotion`, bu ek galeri incelemesinden seçilen önizleme ile ayrıntı sahnesi arasındaki devamlılık ilkesini portföyün kendi çizimlerine uyarlar. Proje sahnesi büyük ayrıntı alanında sürer; proje değiştirme ve kapanış kesilebilir. Referansın fotoğrafları, kodu veya birebir sayfa düzeni kopyalanmadı. Kişisel panel ve proje geçişleri için normal bağlantı/düğme semantiği, Escape, odak dönüşü, duraklatma ve azaltılmış hareket karşılıkları kontrol edildi; bu kontroller referans sitelerin performans testi değildir.

**Açık kalan referans:** YVL, kullanıcının ekran görüntüsündeki site için doğru referans değildir. O ekran görüntüsüne ait kesin URL henüz çözülemedi. Bu kaynağın görsel incelemesi ve eşleştirmesi tamamlanmış olarak kaydedilmez; video ve yukarıdaki ek galeri gözlemleri ayrı kaynaklardır.

## 26 Ekim / Yeni motion kaynakları ve cümle rölesi

Dribbble galerisi ve Kalerion, PortfolioSix, Mikan çalışmaları; Kaelorian, Webflow Rexton/Prosma canlı önizlemeleri ve Noctra bu turda ayrıca incelendi. Görülen durumlar, gözlem sınırları, tek cümleli Luci rölesi, kısa açılış döngüsü, SVG işaretler ve kendi arka plan filmimizin ayrıntıları [MOTION-ARASTIRMA.md](MOTION-ARASTIRMA.md) içindedir. Önceki tarihli notlar o sürümlerin kararlarını kaydeder; güncel davranış README ve yeni araştırma kaydında açıklanır.
