(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const mounted = new WeakMap();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function element(name, className, text) {
    const node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function vector(name, attributes) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attributes || {})) node.setAttribute(key, String(value));
    return node;
  }
  function luci() {
    const svg = vector('svg', {viewBox: '0 0 112 112', class: 'narrator-luci', 'aria-hidden': 'true'});
    const tail = vector('g', {class: 'luci-tail'});
    const curl = 'M 35 75 C 7 84, 3 57, 15 49 C 26 42, 32 53, 23 58';
    tail.append(vector('path', {d: curl, fill: 'none', stroke: '#8b8781', 'stroke-opacity': '.65', 'stroke-width': '7', 'stroke-linecap': 'round'}));
    tail.append(vector('path', {d: curl, fill: 'none', stroke: '#050506', 'stroke-width': '4.6', 'stroke-linecap': 'round'}));
    tail.append(vector('path', {d: 'M 20 50 L 30 56 L 19 64 Z', class: 'luci-outline'}));
    svg.append(tail);
    const legs = vector('g', {class: 'luci-legs'});
    legs.append(vector('path', {d: 'M 39 78 L 34 96 L 25 100 Q 21 103 29 104 L 41 103 L 48 84 M 56 82 L 57 98 L 65 102 Q 69 105 60 105 L 50 103 L 48 84', class: 'luci-outline'}));
    svg.append(legs);
    svg.append(vector('path', {d: 'M 31 49 C 25 40 25 29 30 22 L 40 32 C 44 29 49 28 53 29 L 61 17 Q 66 22 64 35 C 69 39 70 44 69 49 L 79 52 Q 85 55 78 59 L 69 61 C 74 72 69 84 59 88 C 43 94 29 85 29 72 C 27 63 29 55 31 49 Z', class: 'luci-outline'}));
    const eye = vector('g', {class: 'luci-eye'});
    eye.append(vector('ellipse', {cx: 51, cy: 47, rx: '12.5', ry: '15.5', fill: '#e7e3db'}));
    const pupil = vector('ellipse', {cx: 54, cy: 47, rx: '3', ry: '8.5', fill: '#050506', class: 'luci-pupil'});
    eye.append(pupil);
    svg.append(eye);
    svg.append(vector('path', {d: 'M 65 61 Q 71 63 77 58 M 70 62 L 71 66 L 74 61', fill: 'none', stroke: '#e7e3db', 'stroke-width': '1.3', 'stroke-linecap': 'round', class: 'luci-mouth'}));
    const arm = vector('g', {class: 'luci-arm'});
    arm.append(vector('path', {d: 'M 62 72 Q 71 76 79 73 L 84 69 M 79 73 L 85 74 M 79 73 L 82 78', fill: 'none', stroke: '#9a958b', 'stroke-width': '1.5', 'stroke-linecap': 'round'}));
    svg.append(arm);
    return {svg, pupil};
  }




  const GLYPHS = {
    A:['01110','10001','10001','11111','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'],
    C:['01111','10000','10000','10000','10000','10000','01111'], D:['11110','10001','10001','10001','10001','10001','11110'],
    E:['11111','10000','10000','11110','10000','10000','11111'], F:['11111','10000','10000','11110','10000','10000','10000'],
    G:['01111','10000','10000','10111','10001','10001','01111'], H:['10001','10001','10001','11111','10001','10001','10001'],
    I:['11111','00100','00100','00100','00100','00100','11111'], J:['00111','00010','00010','00010','10010','10010','01100'],
    K:['10001','10010','10100','11000','10100','10010','10001'], L:['10000','10000','10000','10000','10000','10000','11111'],
    M:['10001','11011','10101','10101','10001','10001','10001'], N:['10001','11001','11001','10101','10011','10011','10001'],
    O:['01110','10001','10001','10001','10001','10001','01110'], P:['11110','10001','10001','11110','10000','10000','10000'],
    Q:['01110','10001','10001','10001','10101','10010','01101'], R:['11110','10001','10001','11110','10100','10010','10001'],
    S:['01111','10000','10000','01110','00001','00001','11110'], T:['11111','00100','00100','00100','00100','00100','00100'],
    U:['10001','10001','10001','10001','10001','10001','01110'], V:['10001','10001','10001','10001','10001','01010','00100'],
    W:['10001','10001','10001','10101','10101','11011','10001'], X:['10001','10001','01010','00100','01010','10001','10001'],
    Y:['10001','10001','01010','00100','00100','00100','00100'], Z:['11111','00001','00010','00100','01000','10000','11111'],
    '0':['01110','10011','10101','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],
    '2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],
    '4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],
    '6':['01111','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],
    '8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','11110'],
    '+':['00000','00100','00100','11111','00100','00100','00000']
  };
  // Compact letters keep seven rows: the word never changes height mid-scene.
  const COMPACT = {
    A:['010','101','101','111','101','101','101'],B:['110','101','101','110','101','101','110'],C:['011','100','100','100','100','100','011'],D:['110','101','101','101','101','101','110'],
    E:['111','100','100','110','100','100','111'],F:['111','100','100','110','100','100','100'],G:['011','100','100','101','101','101','011'],H:['101','101','101','111','101','101','101'],
    I:['111','010','010','010','010','010','111'],J:['011','001','001','001','101','101','010'],K:['101','101','110','100','110','101','101'],L:['100','100','100','100','100','100','111'],
    M:['101','111','111','101','101','101','101'],N:['101','111','111','111','101','101','101'],O:['010','101','101','101','101','101','010'],P:['110','101','101','110','100','100','100'],
    Q:['010','101','101','101','101','111','011'],R:['110','101','101','110','110','101','101'],S:['011','100','100','010','001','001','110'],T:['111','010','010','010','010','010','010'],
    U:['101','101','101','101','101','101','111'],V:['101','101','101','101','101','101','010'],W:['101','101','101','101','111','111','101'],X:['101','101','101','010','101','101','101'],
    Y:['101','101','101','010','010','010','010'],Z:['111','001','001','010','100','100','111']
  };
  const SYNTAX = ['#9cdcfe','#4ec9b0','#dcdcaa','#ce9178','#f9a8d4'];
  const FADE_MS = 1600, MIN_HOLD = 4200, READ_MS = 5000, STAGGER = 900, TRANSFER_MS = 700;
  const transliterate = value => String(value).replace(/[ıİ]/g,'I').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  // Handwritten micro-dialogues, not portfolio claims or sentence permutations.
  const TOPICS = [
    [['QUERY','INDEX'],['Read only the rows you need.','Let the index shorten the search.'],['SORGU','INDEKS'],['Yalnız gereken satırları sorgula.','İndeksle arama yolunu kısalt.']],
    [['NULL','GUARD'],['TypeError: cannot read null.','if (value == null) return null;'],['BOS','KORU'],['TypeError: boş değere erişildi.','Değeri kullanmadan önce boşluğu kontrol et.']],
    [['EVENT','QUEUE'],['An event arrived. Keep it small.','Queue the work; preserve the order.'],['OLAY','KUYRUK'],['Yeni olay geldi; sınırı belirle.','İşi sıraya al, düzeni koru.']],
    [['CACHE','FRESH'],['Reuse the value while it is valid.','Expire stale data before it spreads.'],['BELLEK','TAZE'],['Geçerli sonucu bellekte tut.','Eski veriyi yenisiyle değiştir.']],
    [['TOKEN','GUARD'],['A token identifies this request.','Check permission before the action.'],['JETON','YETKI'],['İstek kimliğini önce doğrula.','İşlemden önce yetkiyi kontrol et.']],
    [['INPUT','CHECK'],['Treat every input as untrusted.','Validate at the system boundary.'],['GIRDI','ONAY'],['Önce gelen veriyi doğrula.','Geçersiz veriyi akışa alma.']],
    [['STATE','STORE'],['Keep one clear source of state.','Change it through a small action.'],['DURUM','DEPO'],['Durum için tek kaynak belirle.','Değişikliği küçük adımla uygula.']],
    [['FETCH','RETRY'],['The request has a time budget.','Retry gently; avoid a request storm.'],['ISTEK','TEKRAR'],['İsteğin bir zaman sınırı olsun.','Tekrar denerken sisteme yüklenme.']],
    [['PATCH','TEST'],['Make the smallest useful change.','Test the behavior that could break.'],['YAMA','TEST'],['Gerekli olan en küçük yamayı yap.','Bozulabilecek davranışı test et.']],
    [['BUILD','SHIP'],['Build the artifact from the source.','Ship only after the checks pass.'],['DERLE','YAYIN'],['Kaynak koddan çıktıyı üret.','Kontroller geçince sürümü yayınla.']],
    [['ROUTE','PARAM'],['A route is an interface boundary.','Parse its parameters explicitly.'],['ROTA','PARAM'],['Rota bir arayüz sınırıdır.','Parametreleri açıkça ayrıştır.']],
    [['ERROR','CATCH'],['Failures need a visible path back.','Catch the error; keep its context.'],['HATA','YAKALA'],['Hata için dönüş yolu bırak.','Hatayı bağlamıyla birlikte yakala.']],
    [['SELECT','WHERE'],['Choose the columns before the scan.','Filter the rows close to the data.'],['SEC','KOSUL'],['Önce gereken sütunları seç.','Koşulu veriye yakın uygula.']],
    [['TABLE','ROW'],['Each row needs a stable identity.','Keep the key separate from the view.'],['TABLO','SATIR'],['Her satırın sabit kimliği olsun.','Anahtarı görünümden ayrı tut.']],
    [['SCHEMA','FIELD'],['Describe the shape before the write.','A field needs a name and a type.'],['SEMA','ALAN'],['Yazmadan önce veri şeklini tanımla.','Her alanın adı ve türü olsun.']],
    [['COMMIT','DIFF'],['Save one coherent unit of change.','Read the diff before the commit.'],['KAYDET','FARK'],['Bir bütün oluşturan değişikliği kaydet.','Kaydetmeden önce farkı incele.']],
    [['THREAD','LOCK'],['Shared state needs clear ownership.','Lock briefly; release on every path.'],['ISLEM','KILIT'],['Ortak durumun sahibini belirle.','Kilidi kısa tut, her yolda bırak.']],
    [['ASYNC','AWAIT'],['Start the work without blocking.','await job(); resumes when it settles.'],['ASENK','BEKLE'],['İşi başlat, arayüzü bekletme.','Sonuç gelince akışa devam et.']],
    [['STREAM','CHUNK'],['Process the stream in small pieces.','A chunk should fit the memory budget.'],['AKIS','PARCA'],['Akışı küçük parçalarla işle.','Her parça bellek sınırına uysun.']],
    [['ECONN','RESET'],['ECONNRESET: peer closed the socket.','Reconnect with a bounded retry budget.'],['SOKET','TEKRAR'],['ECONNRESET: bağlantı karşıdan kapandı.','Sınırlı beklemeyle yeniden bağlan.']],
    [['PARSE','FORMAT'],['Read structured text with a parser.','Format only after the data is valid.'],['AYIKLA','BICIM'],['Yapılı metni ayrıştırıcıyla oku.','Veri geçerliyse biçimlendirmeye geç.']],
    [['TYPE','ERROR'],['TypeError: value is not callable.','if (typeof fn !== "function") return;'],['TUR','HATA'],['TypeError: bu değer çağrılamıyor.','Çağırmadan önce fonksiyon türünü doğrula.']],
    [['LIMIT','OFFSET'],['Bound the size of every result.','Move through pages in a stable order.'],['SINIR','ATLA'],['Sonuç boyutuna bir sınır koy.','Sayfaları sabit sırayla dolaş.']],
    [['429','DELAY'],['HTTP 429: too many requests.','Respect Retry-After before retrying.'],['SINIR','BEKLE'],['HTTP 429: istek sınırı aşıldı.','Retry-After varsa belirtilen süreyi bekle.']],
    [['INSERT','UPDATE'],['New data enters through one path.','Update only the fields that changed.'],['EKLE','GUNCEL'],['Yeni veri tek bir yoldan girsin.','Yalnız değişen alanları güncelle.']],
    [['EPIPE','WRITE'],['EPIPE: write reached a closed pipe.','Check the connection before writing.'],['KOPTU','YAZMA'],['EPIPE: kapalı kanala yazma denemesi.','Yazmadan önce bağlantıyı kontrol et.']],
    [['CORS','ORIGIN'],['The origin failed the browser check.','Verify allowed origins at the server.'],['KOKEN','IZIN'],['CORS: tarayıcı bu kökene izin vermedi.','Sunucuda izin verilen kökenleri doğrula.']],
    [['PIXEL','FRAME'],['One frame has a small time budget.','Move only what the eye can follow.'],['PIKSEL','KARE'],['Bir karenin zaman payı küçüktür.','Gözün izleyebileceği kadar hareket et.']],
    [['ABORT','FETCH'],['AbortError: request was cancelled.','controller.abort(); stops this request.'],['IPTAL','ISTEK'],['AbortError: bu istek iptal edildi.','İptal edilen isteğin sonucunu kullanma.']],
    [['TRACE','DEBUG'],['Follow the cause across boundaries.','Trace the evidence across the call stack.'],['IZLE','AYIKLA'],['Nedeni sistem sınırları boyunca izle.','Çağrı yığınında hatanın kaynağını izle.']],
    [['LOG','WARN'],['Write the context that will matter.','A warning should suggest a next step.'],['KAYIT','UYARI'],['Sonra gerekecek bağlamı kaydet.','Uyarı bir sonraki adımı anlatsın.']],
    [['ASSERT','FAIL'],['assert(queue.length >= 0); // invariant','AssertionError: inspect the state first.'],['KOSUL','HATA'],['Invariant: durum varsayımını doğrula.','AssertionError: hatayı kaynağında ara.']],
    [['DNS','TTL'],['DNS resolves a name into records.','Keep a cached answer within its TTL.'],['DNS','SURE'],['DNS, adı kaynak kayıtlarına çözer.','Önbellekteki yanıtın TTL sınırını koru.']],
    [['TCP','BYTES'],['TCP carries an ordered byte stream.','Define your own message boundaries.'],['AKIS','BAYT'],['TCP, sıralı bir bayt akışı taşır.','Mesaj sınırlarını protokolünde tanımla.']],
    [['TLS','CERT'],['Check the certificate and hostname.','Encrypted transport still needs trust.'],['TLS','BELGE'],['Sertifikayı ve alan adını doğrula.','Şifreli taşıma da güven denetimi ister.']],
    [['ETAG','MATCH'],['Send the validator with the next request.','A matching ETag can avoid a full body.'],['ETIKET','ESLE'],['Sonraki istekte doğrulayıcıyı gönder.','Eşleşen ETag tam gövde aktarımını önler.']],
    [['H2','FLOW'],['Many streams can share one connection.','Respect the receiver flow window.'],['H2','AKIS'],['Tek bağlantıyı birçok akış paylaşabilir.','Alıcının akış penceresine saygı duy.']],
    [['URL','PATH'],['Parse a URL before reading its parts.','Encode values at their own boundary.'],['ADRES','YOL'],['Adresin parçalarını ayrıştırarak oku.','Değerleri ait oldukları sınırda kodla.']],
    [['JSON','UTF8'],['JSON text is a transport representation.','Parse it before checking the shape.'],['JSON','UTF8'],['JSON metni, verinin taşıma biçimidir.','Veri şeklini sınamadan önce ayrıştır.']],
    [['FETCH','BODY'],['A response body is a consumable stream.','Check status before trusting the payload.'],['ISTEK','GOVDE'],['Yanıt gövdesi tüketilen bir akıştır.','İçeriğe güvenmeden durum kodunu denetle.']],
    [['ABORT','CLEAN'],['Cancel work that no longer has a reader.','Detach listeners when their owner leaves.'],['IPTAL','TEMIZ'],['Okuyucusu kalmayan işi iptal et.','Sahibi ayrılan dinleyiciyi temizle.']],
    [['TIME','BOUND'],['Give slow dependencies a deadline.','A timeout must release its resources.'],['SURE','SINIR'],['Yavaş bağımlılığa süre sınırı koy.','Süre aşımında kaynakları serbest bırak.']],
    [['RETRY','SPREAD'],['Space retries with a little jitter.','Do not let every client retry together.'],['TEKRAR','DAGIT'],['Tekrar denemeleri küçük sapmayla dağıt.','Tüm istemciler aynı anda yüklenmesin.']],
    [['HEAD','BODY'],['HEAD asks for metadata without the body.','Use the headers for a cheaper check.'],['BASLIK','GOVDE'],['HEAD, gövde olmadan üstbilgi ister.','Hafif bir denetim için başlıklara bak.']],
    [['RANGE','BYTES'],['Request only the byte range you need.','Check Content-Range before joining parts.'],['ARALIK','BAYT'],['Yalnız gereken bayt aralığını iste.','Parçaları birleştirirken aralığı doğrula.']],
    [['POST','KEY'],['A retried write may arrive more than once.','Use a deduplication key for that action.'],['GONDER','KIMLIK'],['Tekrarlanan yazma birden çok gelebilir.','Bu işlem için tekrar önleyici kimlik kullan.']],
    [['PROXY','TRUST'],['Forwarded headers need a trust boundary.','Know which proxy can assert the client.'],['VEKIL','GUVEN'],['Aktarılan başlıkların güven sınırı olsun.','İstemciyi hangi vekilin bildirdiğini bil.']],
    [['SOCKET','CLOSE'],['A socket can close between two writes.','Handle the failure at the write itself.'],['SOKET','KAPAT'],['Soket iki yazma arasında kapanabilir.','Hatayı yazma işleminin içinde ele al.']],
    [['JOIN','KEY'],['Join through an explicit relationship.','Check how many rows each side contributes.'],['BAGLA','KIMLIK'],['Tabloları açık bir ilişkiyle birleştir.','Her tarafın ürettiği satır sayısını izle.']],
    [['FK','CHECK'],['A foreign key guards a relationship.','Keep orphan records out of the model.'],['BAG','ONAY'],['Yabancı anahtar, veri ilişkisini korur.','Modelde sahipsiz kayıtlar bırakma.']],
    [['BEGIN','COMMIT'],['Group related writes in one transaction.','Commit only when the whole unit succeeds.'],['BASLA','KAYDET'],['İlgili yazmaları tek işlemde topla.','Bütün adımlar başarılıysa kalıcılaştır.']],
    [['UNIQUE','KEY'],['Let the database reject duplicate keys.','Decide how missing values should behave.'],['TEKIL','KIMLIK'],['Yinelenen anahtarı veritabanı reddetsin.','Eksik değerlerin kuralını ayrıca belirle.']],
    [['UPSERT','ROW'],['Choose the conflict target explicitly.','Do not overwrite fields by accident.'],['EKLE','GUNCEL'],['Çakışmanın hangi anahtarda olduğunu belirt.','Alanların üstüne yanlışlıkla yazma.']],
    [['WAL','READ'],['WAL separates appended writes from reads.','Checkpoint before the log grows too far.'],['WAL','OKU'],['WAL, eklenen yazmaları okumadan ayırır.','Günlük büyürken kontrol noktası planla.']],
    [['MVCC','VIEW'],['Readers need a consistent data version.','Keep long transactions under observation.'],['MVCC','ANLIK'],['Okuyucuya tutarlı veri sürümü sun.','Uzun açık işlemleri gözlem altında tut.']],
    [['PLAN','SCAN'],['Read the query plan before tuning it.','An index is useful when the plan uses it.'],['PLAN','TARA'],['Ayarlamadan önce sorgu planını oku.','İndeks, plana katkı sağladığında yararlıdır.']],
    [['ALTER','STAGE'],['Evolve a schema in compatible steps.','Let old and new code overlap safely.'],['DEGIS','ADIM'],['Şemayı uyumlu adımlarla geliştir.','Eski ve yeni kod bir süre birlikte çalışsın.']],
    [['CURSOR','PAGE'],['Page from a stable key and tie-breaker.','Changing rows should not repeat the page.'],['IMLEC','SAYFA'],['Sayfayı sabit ve tekil sırayla sürdür.','Değişen satırları tekrar göstermemeye bak.']],
    [['COUNT','GROUP'],['Group by the dimension you are measuring.','Do not confuse rows with distinct values.'],['SAY','TOPLA'],['Ölçtüğün boyuta göre gruplama yap.','Satır sayısını tekil değerle karıştırma.']],
    [['CHECK','RULE'],['Put a durable rule near the stored data.','Reject a broken invariant at the write.'],['KOSUL','KURAL'],['Kalıcı kuralı saklanan veriye yakın tut.','Bozuk varsayımı yazma anında reddet.']],
    [['UTC','CLOCK'],['Store the instant with explicit semantics.','Apply the display timezone at the edge.'],['UTC','SAAT'],['Anı, zaman anlamı açık olacak şekilde sakla.','Görüntüleme saat dilimini arayüzde uygula.']],
    [['MONEY','CENT'],['Give money an explicit unit and precision.','Keep the currency beside the amount.'],['TUTAR','KURUS'],['Paranın birimini ve hassasiyetini belirle.','Para birimini tutarla birlikte taşı.']],
    [['BACKUP','VERIFY'],['A backup is useful only if it restores.','Rehearse recovery before the incident.'],['YEDEK','SINA'],['Yedek, geri yüklenebiliyorsa işe yarar.','Kurtarmayı olay çıkmadan önce prova et.']],
    [['TX','ROLLBK'],['Roll back a unit that cannot finish.','Release its locks on the failure path.'],['ISLEM','GERIAL'],['Tamamlanamayan işlem birimini geri al.','Hata yolunda tuttuğu kilitleri bırak.']],
    [['DOM','PATCH'],['Reuse a node when its identity is stable.','Patch the part whose value has changed.'],['DOM','YAMA'],['Kimliği sabit düğümü yeniden kullan.','Yalnız değeri değişen bölümü güncelle.']],
    [['EVENT','PHASE'],['An event travels through distinct phases.','Use capture only when the path needs it.'],['OLAY','FAZ'],['Olay farklı yayılma evrelerinden geçer.','Yakalamayı akışın gerektirdiği yerde kullan.']],
    [['FOCUS','TAB'],['Keep the focus order easy to predict.','Return focus when a temporary view closes.'],['ODAK','TUS'],['Odak sırasını tahmin edilebilir tut.','Geçici görünüm kapanınca odağı geri ver.']],
    [['ARIA','NAME'],['An icon button needs an accessible name.','Prefer a visible label when it can fit.'],['ARIA','AD'],['Simge düğmesinin erişilebilir adı olsun.','Yer varsa görünür etiketi tercih et.']],
    [['LABEL','INPUT'],['Connect each label to its input control.','A placeholder is not a lasting label.'],['ETIKET','GIRDI'],['Her etiketi ilgili girişle ilişkilendir.','Yer tutucu, kalıcı etiket yerine geçmez.']],
    [['GRID','FLEX'],['Choose the layout from the relationship.','Let content influence the available space.'],['IZGARA','ESNEK'],['Yerleşimi öğelerin ilişkisine göre seç.','İçerik, kullanılabilir alanı etkileyebilsin.']],
    [['WIDTH','CLAMP'],['Bound fluid sizes at both extremes.','A narrow screen should still keep meaning.'],['GENIS','SINIR'],['Akışkan ölçünün iki ucuna da sınır koy.','Dar ekranda da anlamı koruyan yer bırak.']],
    [['RAF','PAINT'],['Ask for a frame only while motion needs it.','Use elapsed time instead of counting frames.'],['KARE','BOYA'],['Hareket gerektiriyorsa yeni kare iste.','Kare saymak yerine geçen süreyi kullan.']],
    [['READ','WRITE'],['Read geometry before changing the styles.','Batch writes instead of forcing reflow.'],['OKU','YAZ'],['Stili değiştirmeden önce geometriyi oku.','Yeniden yerleşim için yazmaları grupla.']],
    [['LAYOUT','SHIFT'],['Reserve space before content arrives.','A late image should not move the controls.'],['DUZEN','KAYMA'],['İçerik gelmeden önce yerini ayır.','Geç yüklenen görsel kontrolleri kaydırmasın.']],
    [['PIXEL','DPR'],['Separate canvas pixels from CSS size.','Scale drawing for the actual pixel ratio.'],['PIKSEL','ORAN'],['Tuval pikselini CSS ölçüsünden ayrı tut.','Çizimi gerçek piksel oranına göre ölçekle.']],
    [['SVG','PATH'],['A viewBox defines the drawing coordinates.','Keep the visible tip and hit point aligned.'],['SVG','YOL'],['viewBox, çizimin koordinatlarını tanımlar.','Görünen uçla tıklama noktasını hizala.']],
    [['MATRIX','ORIGIN'],['Transforms compose in a specific order.','Choose the pivot before rotating a shape.'],['DONUS','MERKEZ'],['Dönüşümler belirli bir sırayla birleşir.','Şekli döndürmeden önce merkezini belirle.']],
    [['EASE','SPRING'],['A spring needs damping as well as force.','Keep its integration stable on slow frames.'],['EGRI','YAY'],['Yay için kuvvet kadar sönüm de gerekir.','Yavaş karelerde de hesabı kararlı tut.']],
    [['REDUCE','MOTION'],['Keep the meaning when motion is reduced.','Replace the journey with a readable state.'],['AZALT','AKIS'],['Hareket azalınca anlamı korumaya devam et.','Yolculuk yerine okunur durum göster.']],
    [['FONT','GLYPH'],['A font needs the characters you actually use.','Check the fallback before it reaches users.'],['FONT','GLIF'],['Font, kullandığın karakterleri içersin.','Yedek fontu kullanıcıdan önce kontrol et.']],
    [['QUEUE','ACK'],['Acknowledge work after its durable result.','A repeated delivery needs a safe handler.'],['KUYRUK','ONAY'],['İşi, kalıcı sonucu oluşunca onayla.','Yinelenen teslimi güvenli biçimde ele al.']],
    [['ORDER','STAMP'],['Choose a clear ordering rule for events.','Resolve equal timestamps with a stable key.'],['SIRA','DAMGA'],['Olaylar için açık bir sıralama kuralı seç.','Eşit zamanları sabit anahtarla ayır.']],
    [['LEASE','EXPIRE'],['A lease does not grant ownership forever.','Fence out workers whose lease has expired.'],['KIRA','BITIS'],['Süreli izin sonsuz sahiplik sağlamaz.','Süresi dolan işçinin yazmasını engelle.']],
    [['HEART','BEAT'],['A heartbeat is evidence of recent contact.','Silence needs a timeout before a verdict.'],['NABIZ','YANIT'],['Kalp atışı, yakın temasın bir işaretidir.','Sessizlikte karar vermeden süreyi bekle.']],
    [['FUSE','RESET'],['Stop flooding a dependency that is failing.','Probe recovery before reopening the flow.'],['KESICI','SIFIR'],['Hata veren bağımlılığa yük bindirmeyi kes.','Akışı açmadan toparlanmayı yokla.']],
    [['TRACE','SPAN'],['Carry the trace context across boundaries.','A span should describe one useful operation.'],['IZLE','SPAN'],['İz bağlamını sistem sınırlarından geçir.','Her span anlamlı bir işlemi anlatsın.']],
    [['METRIC','RATE'],['Rates need a clear measurement interval.','Keep labels bounded to protect the store.'],['OLCUM','HIZ'],['Hız için ölçüm aralığını açıkça belirle.','Etiket çeşitliliğini sınırlı tut.']],
    [['CLOCK','MONO'],['Use a monotonic clock for elapsed time.','Wall-clock adjustments should not rewind it.'],['SAAT','TEKYON'],['Geçen süreyi tek yönlü saatle ölç.','Duvar saati değişince süre gerilemesin.']],
    [['HEAP','FREE'],['Keep references only while they are useful.','Remove stale timers and detached listeners.'],['YIGIN','BOSALT'],['Referansı yalnız ihtiyaç sürerken tut.','Eski zamanlayıcı ve dinleyicileri temizle.']],
    [['RANGE','CHECK'],['Validate a range before indexing memory.','Check the upper bound as well as the lower.'],['ARALIK','BAK'],['Belleğe erişmeden önce aralığı doğrula.','Alt sınır kadar üst sınırı da denetle.']],
    [['BUFFER','DRAIN'],['Pause writes when the consumer falls behind.','Resume after the writable stream drains.'],['TAMPON','BOSALT'],['Tüketici yavaşlayınca yazmayı duraklat.','Yazma akışı boşalınca üretime devam et.']],
    [['WORKER','POST'],['Send a message across the worker boundary.','Make the transferred data shape explicit.'],['ISCI','ILETI'],['İşçi sınırından ileti göndererek geç.','Aktarılan verinin şeklini açıkça tanımla.']],
    [['ATOMIC','SWAP'],['Compare the expected value before a swap.','Keep a shared update inside one operation.'],['ATOMIK','TAKAS'],['Takastan önce beklenen değeri karşılaştır.','Ortak güncellemeyi tek işlemde tut.']],
    [['MUTEX','CLEAN'],['Acquire one owner for a critical section.','Release ownership even when the work fails.'],['KILIT','TEMIZ'],['Kritik bölüme bir sahip atayarak gir.','İş başarısız olsa da sahipliği bırak.']],
    [['DEAD','LOCK'],['Agree on lock order across the system.','A waiting cycle needs a path to recovery.'],['KILIT','DONGU'],['Sistem boyunca kilit sırasında anlaş.','Bekleme döngüsüne kurtarma yolu bırak.']],
    [['HEALTH','READY'],['Alive and ready are different conditions.','Accept traffic only when dependencies fit.'],['SAGLIK','HAZIR'],['Canlı olmakla hazır olmak farklıdır.','Bağımlılıklar uygunsa trafiği kabul et.']]
  ];
  const ROUNDS = TOPICS.flatMap(topic => [
    {lang:'EN',words:topic[0],thoughts:topic[1]},
    {lang:'TR',words:topic[2],thoughts:topic[3]}
  ]);
  function createTopicOrder(previous=-1,intro=false,random=Math.random) {
    const order=Array.from({length:TOPICS.length},(_,index)=>index);
    for(let index=order.length-1;index>0;index--){const other=Math.floor(random()*(index+1));[order[index],order[other]]=[order[other],order[index]];}
    // Every topic appears once per cycle; its EN/TR pair is never separated.
    const first=intro?order.indexOf(0):order[0]===previous?1:0;
    [order[0],order[first]]=[order[first],order[0]];
    return order;
  }
  function regionFor(side, round) {
    // Both writers borrow the same matrix. Paired EN/TR scenes keep their
    // geography; the next pair changes the boundary and periodically swaps it.
    const pair = Math.floor(round / 2), split = [26,24,28,25,27][pair % 5];
    const region = (side + Math.floor(pair / 2)) % 2;
    // Two empty columns separate the current words. This breathing space moves
    // with the split, so no columns are permanently excluded from writing.
    return {start:region === 0 ? 0 : split+1,end:region === 0 ? split-1 : 52,region,pair};
  }
  function compileWord(value, side, round = 0) {
    const word = transliterate(value), compact = word.length > 4;
    const font = compact ? COMPACT : GLYPHS, glyphWidth = compact ? 3 : 5;
    const width = word.length * (glyphWidth + 1) - 1;
    const {start,end,region,pair} = regionFor(side,round), slack = end-start-width;
    const alignment = (pair+side)%3;
    const left = start + (alignment === 0 ? slack : alignment === 1 ? 0 : Math.floor(slack/2)), route = [];
    [...word].forEach((letter, letterIndex) => {
      const glyph = font[letter] || font.O;
      for(let line = 0; line < 7; line++) {
        const row = letterIndex % 2 ? 6 - line : line;
        const offsets = Array.from({length:glyphWidth},(_,i)=>i);
        if((line + letterIndex) % 2) offsets.reverse();
        offsets.forEach(offset => {
          if(glyph[row][offset] === '1') {
            const column = left + letterIndex * (glyphWidth + 1) + offset;
            route.push({column,row,index:column * 7 + row,letter:letterIndex});
          }
        });
      }
    });
    return {word,width,left,start,end,region,route,hop:clamp(route.length * 95,4200,6500) / route.length};
  }
  function mount(options) {
    const {panel,grid,scroll} = options || {};
    if(!panel || !grid || !scroll) throw new Error('ActivityNarrator: panel, grid ve scroll gerekli.');
    if(mounted.has(panel)) mounted.get(panel).destroy();
    const hadClass = panel.classList.contains('has-activity-narrator'); panel.classList.add('has-activity-narrator');
    const root = element('div','activity-narrator');root.dataset.ready='false';root.dataset.active='false';
    const tethers = vector('svg',{class:'narrator-tethers','aria-hidden':'true'});
    root.append(tethers);
    const fracture = element('span','narrator-fracture');fracture.setAttribute('aria-hidden','true');root.append(fracture);
    const helper = element('span','narrator-sr','İki Luci aynı matrisi paylaşır ve yazarken yer değiştirir. Siyah Luci ve renkli yazar, İngilizce ve Türkçe teknik düşünceleri paylaşır. Renkli izler geçicidir; gerçek etkinlik kayıtları değişmez. Balona tıklamak, okunmakta olan düşünceyi kesmeden sıradakini kuyruğa alır.');
    const announcement = element('span','narrator-sr');announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');root.append(helper,announcement);panel.append(root);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanups = [], owners = new Map(), retired = [], errorInk = [];
    let reduced = Boolean(options.reducedMotion) || media.matches, paused=false, visible=false, destroyed=false;
    let frame=0,layoutFrame=0,previous=0,time=0,dirty=true,points=[],roundIndex=0,roundBorn=0,pendingRight=null,transitioning=false;
    let wordsStarted=0,generationId=0,errorCount=0,panelFaultUntil=0;
    let topicOrder=createTopicOrder(-1,true),cycle=1;
    let box={width:820,size:42,pitch:14,gridTop:200,bubbleTop:24};
    const data=(name,value)=>{const next=String(value);if(root.dataset[name]!==next)root.dataset[name]=next;};
    data('bankSize',ROUNDS.length);data('thoughtCount',ROUNDS.length*2);data('topicCount',TOPICS.length);data('cycle',cycle);data('fadeMs',FADE_MS);data('holdMs',MIN_HOLD);data('errorCount',0);data('collisions',0);data('staggerMs',STAGGER);
    function entryAt(index){return ROUNDS[topicOrder[Math.floor(index/2)]*2+index%2];}
    function advanceIndex(){const next=(roundIndex+1)%ROUNDS.length;if(next===0){topicOrder=createTopicOrder(topicOrder.at(-1));data('cycle',++cycle);}return next;}
    function listen(target,type,fn,settings){target.addEventListener(type,fn,settings);cleanups.push(()=>target.removeEventListener(type,fn,settings));}
    function createActor(side,color) {
      const node=element('div','narrator-character');node.setAttribute('aria-hidden','true');node.dataset.zone=side===0?'left':'right';node.dataset.color=side===0?'black':color;
      node.style.setProperty('--luci-body',side===0?'#050506':color);
      const drawing=luci(),shadow=element('span','narrator-shadow');node.append(drawing.svg);root.append(shadow,node);
      return {node,drawing,shadow,side,color,current:(side===0?1:29)*7+6,direction:1,retire:null};
    }
    const zones=[0,1].map(side=>{
      const bubble=element('button','narrator-thought');bubble.type='button';bubble.dataset.zone=side===0?'left':'right';
      const terminal=element('span','narrator-terminal');terminal.setAttribute('aria-hidden','true');
      const bar=element('span','narrator-terminal-bar'),led=element('i','narrator-led'),label=element('span','narrator-worker',`worker ${String(side+1).padStart(2,'0')}`),language=element('span','narrator-language'),status=element('span','narrator-status','RUN');
      bar.append(led,label,language,status);
      const line=element('span','narrator-line'),copy=element('span','narrator-copy'),caret=element('span','narrator-caret','▍');line.append(copy,caret);
      const tip=element('span','narrator-tip','sıradaki ↵');terminal.append(bar,line,tip);bubble.append(terminal);
      const tether=vector('path',{});tethers.append(tether);root.append(bubble);
      const zone={side,bubble,copy,language,status,tip,tether,actor:createActor(side,SYNTAX[0]),generation:null,requested:false,bubbleX:0,bubbleY:0,bubbleWidth:250,bubbleHeight:110};
      listen(bubble,'click',()=>{
        if(reduced){resetRound(advanceIndex(),true);return;}
        zone.requested=true;tip.textContent='okununca ↵';bubble.dataset.queued='true';
        bubble.setAttribute('aria-label',`Düşünce: ${zone.generation.entry.thoughts[side]} Sıradaki düşünce kuyruğa alındı.`);
      });
      return zone;
    });
    function removeActor(actor){actor.node.remove();actor.shadow.remove();}
    function removeRecord(record){
      record.node.remove();const list=owners.get(record.index);if(list){list.delete(record);if(!list.size)owners.delete(record.index);}
    }
    function clearGeneration(generation){if(!generation)return;generation.ink.forEach(removeRecord);generation.ink.clear();}
    function clearAll(){
      zones.forEach(zone=>clearGeneration(zone.generation));
      retired.splice(0).forEach(entry=>{clearGeneration(entry.generation);if(entry.actor)removeActor(entry.actor);});
      errorInk.splice(0).forEach(record=>record.node.remove());owners.clear();
    }
    function createGeneration(zone,index,born){
      const entry=entryAt(index),score=compileWord(entry.words[zone.side],zone.side,index),serial=++wordsStarted;
      const column=Math.floor(zone.actor.current/7),transfer=column<score.start||column>=score.end;
      const generation={id:++generationId,round:index,entry,score,born,step:0,hopStart:null,hopFrom:zone.actor.current,ink:new Map(),doneAt:null,fullAt:null,letters:0,nextLetter:born+80,retire:null,error:null,errorDone:false,errorPlanned:serial%5===0,serial,entryFrom:zone.actor.current,entryStart:null,entryDone:!transfer};
      zone.requested=false;zone.tip.textContent='sıradaki ↵';delete zone.bubble.dataset.queued;
      zone.copy.textContent='';zone.language.textContent=entry.lang;zone.status.textContent='RUN';zone.bubble.dataset.status='run';zone.bubble.dataset.lang=entry.lang;
      zone.bubble.setAttribute('aria-label',`Düşünce: ${entry.thoughts[zone.side]} Sonraki düşünceyi okununca sıraya almak için tıkla.`);
      zone.bubble.style.setProperty('--narrator-accent',zone.side===0?'#ff6a35':zone.actor.color);
      zone.bubble.classList.add('is-typing');zone.generation=generation;
      return generation;
    }
    function announceRound(){const entry=entryAt(roundIndex);announcement.textContent=`${entry.lang}. ${entry.thoughts.join(' ')}`;}
    function beginZone(zone,index,born,overlap){
      const old=zone.generation;
      if(old&&overlap){
        old.retire=time;
        if(zone.side===1){zone.actor.retire=time;zone.actor.node.classList.add('is-retiring');retired.push({generation:old,actor:zone.actor});zone.actor=createActor(1,SYNTAX[index%SYNTAX.length]);}
        else retired.push({generation:old,actor:null});
      } else if(old)clearGeneration(old);
      createGeneration(zone,index,born);
    }
    function resetRound(index,instant){
      clearAll();roundIndex=index;roundBorn=time;pendingRight=null;transitioning=false;panelFaultUntil=0;
      panel.classList.remove('narrator-has-warning');root.classList.remove('is-faulting');
      if(zones[1].actor.retire!==null){removeActor(zones[1].actor);zones[1].actor=createActor(1,SYNTAX[index%SYNTAX.length]);}
      zones.forEach(zone=>beginZone(zone,index,time+(instant?0:zone.side*STAGGER),false));
      if(instant)zones.forEach(zone=>staticWord(zone));announceRound();diagnostics();dirty=true;queueMeasure();
    }
    function nextRound(){
      roundIndex=advanceIndex();roundBorn=time;transitioning=true;
      beginZone(zones[0],roundIndex,time+600,true);pendingRight={index:roundIndex,at:time+STAGGER};announceRound();dirty=true;queueMeasure();
    }
    function addInk(zone,generation,point){
      if(generation.ink.has(point.index))return;
      const cell=points[point.index]&&points[point.index].cell;if(!cell)return;
      const node=element('span','narrator-ink-layer');node.setAttribute('aria-hidden','true');node.dataset.zone=zone.side===0?'left':'right';node.dataset.generation=String(generation.id);node.style.background=zone.side===0?'#ff6a35':zone.actor.color;cell.append(node);
      const record={node,index:point.index,column:point.column,row:point.row,opacity:1,generation:generation.id};generation.ink.set(point.index,record);
      if(!owners.has(point.index))owners.set(point.index,new Set());owners.get(point.index).add(record);
    }
    function available(generation,point){const records=owners.get(point.index);return !records||[...records].every(record=>record.generation===generation.id||record.opacity<=.1);}
    function paint(actor,x,y,scaleX=1,scaleY=1,tilt=0,arc=0){
      const size=box.size;actor.node.style.transform=`translate3d(${(x-size*.5).toFixed(2)}px,${(y-size*.94).toFixed(2)}px,0)`;
      actor.drawing.svg.style.transform=`rotate(${tilt.toFixed(2)}deg) scale(${(scaleX*actor.direction).toFixed(3)},${scaleY.toFixed(3)})`;
      actor.shadow.style.transform=`translate3d(${x.toFixed(2)}px,${(y+arc*Math.min(22,box.pitch*1.4)).toFixed(2)}px,0) scale(${(1-arc*.4).toFixed(2)})`;
      actor.shadow.style.opacity=String(.4-arc*.2);actor.node.classList.toggle('is-airborne',arc>.1);
      const zone=zones[actor.side];
      if(zone.actor===actor){
        const startX=zone.bubbleX+zone.bubbleWidth*.5,startY=zone.bubbleY+zone.bubbleHeight+11,endY=y-size*.8;
        zone.tether.setAttribute('d',`M${startX.toFixed(1)} ${startY.toFixed(1)}Q${startX.toFixed(1)} ${((startY+endY)*.5).toFixed(1)} ${x.toFixed(1)} ${endY.toFixed(1)}`);
      }
    }
    function gaze(actor,dx,dy){actor.drawing.pupil.setAttribute('cx',(54+clamp(dx/60*actor.direction,-3,3)).toFixed(2));actor.drawing.pupil.setAttribute('cy',(47+clamp(dy/55,-2,2)).toFixed(2));}
    function idlePose(zone){const p=points[zone.actor.current];if(p){gaze(zone.actor,zone.bubbleX+zone.bubbleWidth*.5-p.x,zone.bubbleY-p.y);paint(zone.actor,p.x,p.y);}}
    function hopPose(zone,from,to,progress,warning=false){
      const actor=zone.actor,a=points[from],b=points[to];if(!a||!b)return;
      const travel=progress*progress*(3-2*progress),arc=Math.sin(Math.PI*progress);
      actor.direction=b.x===a.x?actor.direction:b.x>a.x?1:-1;
      gaze(actor,b.x-a.x,b.y-a.y);
      const distance=Math.hypot(b.x-a.x,b.y-a.y),height=Math.min(box.size*.52,Math.max(box.pitch*.78,distance*.14))*(warning?1.15:1);
      paint(actor,a.x+(b.x-a.x)*travel,a.y+(b.y-a.y)*travel-arc*height,1-arc*.045,1+arc*.065,actor.direction*arc*(warning?12:7),arc);
    }
    function errorPath(zone,generation){
      const routeSet=new Set(generation.score.route.map(point=>point.index)),current=zone.actor.current,col=Math.floor(current/7),row=current%7,{start,end}=generation.score,candidates=[];
      for(let radius=1;radius<6;radius++)for(let dc=-radius;dc<=radius;dc++)for(let dr=-radius;dr<=radius;dr++){
        if(Math.max(Math.abs(dc),Math.abs(dr))!==radius)continue;
        const c=col+dc,r=row+dr,index=c*7+r;
        if(c<start||c>=end||r<0||r>6||routeSet.has(index)||owners.has(index)||candidates.includes(index))continue;
        candidates.push(index);if(candidates.length===3)return candidates;
      }
      return candidates;
    }
    function startError(zone,generation){
      const route=errorPath(zone,generation);generation.errorDone=true;if(route.length<3)return;
      generation.error={since:time,route,step:0,origin:zone.actor.current,from:zone.actor.current};generation.hopStart=null;
      errorCount++;data('errorCount',errorCount);data('error','warn');
      zone.bubble.dataset.status='warn';zone.status.textContent='WARN';zone.actor.node.classList.add('is-warning');
      panelFaultUntil=time+900;panel.classList.add('narrator-has-warning');root.classList.add('is-faulting');
      const point=points[route[0]];if(point)root.style.setProperty('--fault-y',point.y.toFixed(1)+'px');
    }
    function markError(index){
      const cell=points[index]&&points[index].cell;if(!cell)return;
      const node=element('span','narrator-error-ink');node.setAttribute('aria-hidden','true');cell.append(node);errorInk.push({node,born:time,index});
    }
    function updateError(zone,generation){
      const error=generation.error,elapsed=time-error.since;
      if(elapsed<510){
        const step=Math.min(2,Math.floor(elapsed/170));
        while(error.step<step){const landed=error.route[error.step++];markError(landed);error.from=landed;zone.actor.current=landed;}
        hopPose(zone,error.from,error.route[step],clamp((elapsed-step*170)/170,0,1),true);
      } else if(elapsed<790){
        while(error.step<3){const landed=error.route[error.step++];markError(landed);zone.actor.current=landed;}
        zone.status.textContent='RECOVER';zone.bubble.dataset.status='recover';
        hopPose(zone,error.route[2],error.origin,clamp((elapsed-510)/280,0,1),true);
      } else {
        zone.actor.current=error.origin;generation.error=null;generation.hopStart=null;zone.actor.node.classList.remove('is-warning');zone.status.textContent='RUN';zone.bubble.dataset.status='run';idlePose(zone);
      }
    }
    function updateThought(zone,generation){
      const text=generation.entry.thoughts[zone.side];
      if(time<generation.born||generation.letters>=text.length)return;
      while(generation.letters<text.length&&time>=generation.nextLetter){generation.letters++;generation.nextLetter+=29;}
      zone.copy.textContent=text.slice(0,generation.letters);
      if(generation.letters===text.length){generation.fullAt=time;zone.bubble.classList.remove('is-typing');}
    }
    function updateZone(zone){
      const generation=zone.generation;updateThought(zone,generation);
      if(time<generation.born){idlePose(zone);return;}
      if(generation.error){updateError(zone,generation);return;}
      const route=generation.score.route;
      if(!generation.entryDone){
        // A side exchange is a visible leap, not a one-frame teleport. The
        // previous writer must release this landing cell before takeoff.
        if(generation.entryStart===null){if(!available(generation,route[0])){idlePose(zone);return;}generation.entryStart=time;}
        const progress=clamp((time-generation.entryStart)/TRANSFER_MS,0,1);
        hopPose(zone,generation.entryFrom,route[0].index,progress);
        if(progress>=1&&available(generation,route[0])){addInk(zone,generation,route[0]);zone.actor.current=route[0].index;generation.step=1;generation.entryDone=true;}
        return;
      }
      if(generation.step>=route.length){if(generation.doneAt===null)generation.doneAt=time;idlePose(zone);return;}
      if(generation.errorPlanned&&!generation.errorDone&&generation.step>=Math.floor(route.length*.42)){startError(zone,generation);if(generation.error){updateError(zone,generation);return;}}
      const point=route[generation.step];
      if(!available(generation,point)){generation.hopStart=null;idlePose(zone);return;}
      if(generation.hopStart===null){
        generation.hopStart=time;generation.hopFrom=zone.actor.current;
      }
      const progress=clamp((time-generation.hopStart)/generation.score.hop,0,1);
      hopPose(zone,generation.hopFrom,point.index,progress);
      if(progress>=1){
        // The old generation can only fade while a hop is in flight; it cannot
        // acquire new ink. Check again anyway so ownership is explicit.
        if(available(generation,point)){addInk(zone,generation,point);zone.actor.current=point.index;generation.step++;}
        generation.hopStart+=generation.score.hop;generation.hopFrom=zone.actor.current;
        if(generation.step===route.length)generation.doneAt=time;
      }
    }
    function ready(zone){const g=zone.generation;return g.doneAt!==null&&g.fullAt!==null&&time>=g.doneAt+MIN_HOLD+(zone.requested?0:1000)&&time>=g.fullAt+Math.max(READ_MS,g.entry.thoughts[zone.side].length*88);}
    function fadeRetired(){
      for(let i=retired.length-1;i>=0;i--){
        const entry=retired[i],g=entry.generation,elapsed=time-g.retire;
        g.ink.forEach(record=>{
          const stagger=(record.column-g.score.left)/Math.max(1,g.score.width-1)*600;
          const opacity=clamp(1-(elapsed-stagger)/1000,0,1);record.opacity=opacity;record.node.style.opacity=opacity.toFixed(3);
        });
        if(entry.actor){const opacity=clamp(1-elapsed/FADE_MS,0,1);entry.actor.node.style.opacity=opacity.toFixed(3);entry.actor.shadow.style.opacity=String(opacity*.3);}
        if(elapsed>=FADE_MS){clearGeneration(g);if(entry.actor)removeActor(entry.actor);retired.splice(i,1);}
      }
    }
    function fadeErrors(){for(let i=errorInk.length-1;i>=0;i--){const record=errorInk[i],age=time-record.born;record.node.style.opacity=String(clamp(1-(age-600)/700,0,1));if(age>=1300){record.node.remove();errorInk.splice(i,1);}}}
    function staticWord(zone){const g=zone.generation;g.score.route.forEach(point=>addInk(zone,g,point));g.step=g.score.route.length;g.doneAt=time;g.fullAt=time;g.entryDone=true;g.letters=g.entry.thoughts[zone.side].length;zone.copy.textContent=g.entry.thoughts[zone.side];zone.bubble.classList.remove('is-typing');zone.actor.current=g.score.route.at(-1).index;idlePose(zone);}
    function diagnostics(){
      const phase=[];
      zones.forEach(zone=>{
        const g=zone.generation,key=zone.side===0?'left':'right',currentPhase=g.error?'warn':time<g.born?'enter':!g.entryDone?'travel':g.doneAt!==null?'hold':'draw';
        data(key+'Word',g.score.word);data(key+'Phase',currentPhase);data(key+'Lang',g.entry.lang);data(key+'Ink',g.ink.size);data(key+'Step',g.step);data(key+'Serial',g.serial);data(key+'Body',zone.side===0?'#050506':zone.actor.color);data(key+'ColumnStart',g.score.start);data(key+'ColumnEnd',g.score.end);data(key+'Region',g.score.region);
        data(key+'ReadMs',g.fullAt===null?0:Math.round(time-g.fullAt));data(key+'HoldMs',g.doneAt===null?0:Math.round(time-g.doneAt));phase.push(currentPhase);
      });
      data('phase',phase.includes('warn')?'warn':retired.length?'overlap':phase.includes('draw')||phase.includes('enter')||phase.includes('travel')?'draw':'hold');
      data('error',zones.some(zone=>zone.generation.error)?'warn':errorInk.length?'recover':'none');
      data('actors',2+retired.filter(entry=>entry.actor).length);data('round',roundIndex+1);data('lang',zones[0].generation.entry.lang===zones[1].generation.entry.lang?zones[0].generation.entry.lang:'mixed');
      data('message',zones.map(zone=>zone.generation.score.word).join(' / '));data('inkCount',zones.reduce((sum,zone)=>sum+zone.generation.ink.size,0));data('elapsed',Math.round(time));
    }
    function update(){
      fadeRetired();fadeErrors();
      if(pendingRight&&time>=pendingRight.at){beginZone(zones[1],pendingRight.index,time+600,true);pendingRight=null;transitioning=false;}
      zones.forEach(updateZone);
      if(panelFaultUntil&&time>=panelFaultUntil){panelFaultUntil=0;panel.classList.remove('narrator-has-warning');root.classList.remove('is-faulting');}
      if(!transitioning&&!pendingRight&&zones.every(ready))nextRound();
      diagnostics();
    }
    function measure(){
      dirty=false;const panelRect=panel.getBoundingClientRect(),gridRect=grid.getBoundingClientRect();
      points=[...grid.querySelectorAll('.rhythm-cell')].map(cell=>{const rect=cell.getBoundingClientRect();return {cell,x:rect.left+rect.width/2-panelRect.left,y:rect.top+rect.height*.65-panelRect.top};});
      box={width:panel.clientWidth,size:zones[0].actor.node.offsetWidth||42,pitch:gridRect.width/52,gridTop:gridRect.top-panelRect.top};
      const availableWidth=gridRect.width*.5,bubbleWidth=Math.min(280,Math.max(100,availableWidth-8));
      zones.forEach(zone=>{
        zone.bubble.style.width=bubbleWidth.toFixed(2)+'px';zone.bubbleWidth=bubbleWidth;zone.bubbleHeight=zone.bubble.offsetHeight;
        const region=regionFor(zone.side,roundIndex);
        const center=gridRect.left-panelRect.left+gridRect.width*((region.start+region.end)/104);
        zone.bubbleX=clamp(center-bubbleWidth/2,8,Math.max(8,box.width-bubbleWidth-8));zone.bubbleY=Math.max(14,box.gridTop-zone.bubbleHeight-35);
        zone.bubble.style.transform=`translate3d(${zone.bubbleX.toFixed(2)}px,${zone.bubbleY.toFixed(2)}px,0)`;idlePose(zone);
      });
      data('ready',points.length===364);root.style.setProperty('--narrator-grid-top',box.gridTop.toFixed(2)+'px');
    }
    function activeMotion(){return !destroyed&&!paused&&!reduced&&visible&&!document.hidden&&points.length===364;}
    function queueMeasure(){dirty=true;if(!frame&&!layoutFrame&&!destroyed)layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;measure();sync();});}
    function tick(now){frame=0;if(dirty)measure();if(!activeMotion()){sync();return;}time+=previous?Math.min(50,now-previous):0;previous=now;update();frame=requestAnimationFrame(tick);}
    function sync(){const on=activeMotion();data('active',on);data('reduced',reduced);if(on&&!frame){previous=0;frame=requestAnimationFrame(tick);}if(!on){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}}
    function inViewport(){const rect=panel.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight;}
    function changeMotion(event){reduced=event.matches;resetRound(roundIndex,reduced);measure();diagnostics();sync();}
    listen(scroll,'scroll',queueMeasure,{passive:true});listen(window,'resize',queueMeasure,{passive:true});listen(document,'visibilitychange',sync);
    if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queueMeasure();sync();},{threshold:.02});io.observe(panel);cleanups.push(()=>io.disconnect());}
    else listen(window,'scroll',()=>{visible=inViewport();queueMeasure();sync();},{passive:true});
    if('ResizeObserver'in window){const ro=new ResizeObserver(queueMeasure);[panel,grid,scroll,...zones.map(zone=>zone.bubble)].forEach(node=>ro.observe(node));cleanups.push(()=>ro.disconnect());}
    const mo=new MutationObserver(queueMeasure);mo.observe(grid,{childList:true});cleanups.push(()=>mo.disconnect());
    if(media.addEventListener){media.addEventListener('change',changeMotion);cleanups.push(()=>media.removeEventListener('change',changeMotion));}
    else if(media.addListener){media.addListener(changeMotion);cleanups.push(()=>media.removeListener(changeMotion));}
    zones.forEach(zone=>createGeneration(zone,0,zone.side*STAGGER));visible=inViewport();measure();
    if(reduced)zones.forEach(staticWord);announceRound();diagnostics();sync();
    const api=Object.freeze({setPaused(value){paused=Boolean(value);sync();},destroy(){if(destroyed)return;destroyed=true;sync();if(layoutFrame)cancelAnimationFrame(layoutFrame);cleanups.forEach(cleanup=>cleanup());clearAll();zones.forEach(zone=>removeActor(zone.actor));root.remove();panel.classList.remove('narrator-has-warning');if(!hadClass)panel.classList.remove('has-activity-narrator');mounted.delete(panel);}});
    mounted.set(panel,api);return api;
  }
  window.ActivityNarrator=Object.freeze({mount});
})();
