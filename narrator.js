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
  const READ_MS = 5000;
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
  function createTopicOrder(previous=-1,intro=false,random=Math.random) {
    const order=Array.from({length:TOPICS.length},(_,index)=>index);
    for(let index=order.length-1;index>0;index--){const other=Math.floor(random()*(index+1));[order[index],order[other]]=[order[other],order[index]];}
    // Every topic appears once per cycle; its EN/TR pair is never separated.
    const first=intro?order.indexOf(0):order[0]===previous?1:0;
    [order[0],order[first]]=[order[first],order[0]];
    return order;
  }
  // A short statement occupies one line. Spaces have their own two-column
  // rhythm; the narrow I leaves room for readable phrases on the 52-cell grid.
  const PHRASES = [
    ['USE AN INDEX','INDEKS KULLAN'],['CHECK FOR NULL','BOSLUGU KORU'],['QUEUE THE JOB','ISI SIRAYA AL'],['KEEP IT FRESH','TAZE TUT'],
    ['CHECK ACCESS','IZNI DOGRULA'],['CHECK INPUT','GIRDIYI SINA'],['KEEP ONE STATE','TEK DURUM TUT'],['RETRY GENTLY','YAVASCA DENE'],
    ['TEST THE PATCH','YAMAYI SINA'],['BUILD THEN SHIP','DERLE YAYINLA'],['PARSE THE PATH','YOLU AYRISTIR'],['CATCH ERRORS','HATAYI YAKALA'],
    ['FILTER ROWS','SATIRI SUZ'],['KEEP THE KEY','ANAHTARI TUT'],['DEFINE A TYPE','TURU BELIRLE'],['READ THE DIFF','FARKI OKU'],
    ['LOCK BRIEFLY','KISA KILITLE'],['AWAIT THE JOB','ISI BEKLE'],['STREAM CHUNKS','PARCALA AKIT'],['RESET SAFELY','GUVENLE DON'],
    ['PARSE FIRST','ONCE AYRISTIR'],['CHECK THE TYPE','TURU SINA'],['BOUND THE LIST','LISTEYI SINIRLA'],['WAIT THEN TRY','BEKLE VE DENE'],
    ['UPDATE A ROW','SATIRI YENILE'],['CHECK THE PIPE','KANALI SINA'],['VERIFY ORIGIN','KOKENI SINA'],['PAINT A FRAME','KAREYI BOYA'],
    ['ABORT THE JOB','ISI IPTAL ET'],['TRACE THE BUG','HATAYI IZLE'],['WARN WITH CARE','ANLAMLI UYAR'],['ASSERT A RULE','KURALI SINA'],
    ['RESPECT TTL','SUREYI KORU'],['ORDER BYTES','BAYTI SIRALA'],['VERIFY TRUST','GUVENI SINA'],['MATCH THE TAG','ETIKETI ESLE'],
    ['CONTROL FLOW','AKISI YONET'],['PARSE THE URL','ADRESI AYRISTIR'],['PARSE THE JSON','JSON AYRISTIR'],['CHECK STATUS','DURUMU SINA'],
    ['CLEAN UP WORK','ISI TEMIZLE'],['BOUND THE WAIT','SUREYI SINIRLA'],['SPREAD RETRIES','TEKRARI DAGIT'],['READ THE HEAD','BASLIGI OKU'],
    ['READ A RANGE','ARALIGI OKU'],['DEDUP THE JOB','TEKRARI ELE'],['VERIFY PROXY','VEKILI DOGRULA'],['HANDLE CLOSE','KOPUSU YONET'],
    ['INDEX THE JOIN','JOINI INDEKSLE'],['CHECK A KEY','ANAHTARI SINA'],['BEGIN THEN END','BASLAT BITIR'],['KEEP IT UNIQUE','TEKIL TUT'],
    ['UPSERT THE ROW','ESLE VE YAZ'],['READ WITH WAL','WAL ILE OKU'],['SAVE SNAPSHOT','GORUNUMU TUT'],['READ THE PLAN','PLANI OKU'],
    ['STAGE ALTER','SEMAYI HAZIRLA'],['PAGE BY KEY','ANAHTARLA GEZ'],['COUNT THE ROWS','SATIRI SAY'],['KEEP THE RULE','KURALI KORU'],['STORE IN UTC','UTC ILE SAKLA'],
    ['COUNT IN CENTS','KURUSLA OLC'],['TEST A BACKUP','YEDEGI SINA'],['ROLL IT BACK','ISLEMI GERI AL'],['PATCH THE DOM','DOMU GUNCELLE'],
    ['FOLLOW EVENTS','OLAYI TAKIP ET'],['RETURN FOCUS','ODAGI GERI VER'],['NAME THE ICON','SIMGEYE AD VER'],['LABEL INPUTS','GIRDIYE AD VER'],
    ['LAY OUT WELL','DUZENI KUR'],['CLAMP THE SIZE','BOYUTU SINIRLA'],['PAINT ON TIME','ZAMANINDA BOYA'],['READ THEN EDIT','OKU SONRA YAZ'],
    ['RESERVE SPACE','ALANI AYIR'],['SCALE PIXELS','PIKSELI OLC'],['ALIGN THE TIP','UCU HIZALA'],['CHOOSE A PIVOT','MERKEZI SEC'],
    ['DAMP A SPRING','YAYI SONUMLE'],['REDUCE MOTION','HAREKETI AZALT'],['CHECK A GLYPH','GLIFI SINA'],['ACK THE RESULT','SONUCU ONAYLA'],
    ['ORDER EVENTS','OLAYI SIRALA'],['EXPIRE LEASES','IZNI SONLANDIR'],['WAIT FOR A BEAT','NABZI BEKLE'],['PROBE REPAIR','DONUSU YOKLA'],
    ['CARRY A TRACE','IZI TASI'],['MEASURE A RATE','HIZI OLC'],['USE MONO TIME','TEK YONLU OLC'],['FREE THE HEAP','YIGINI BOSALT'],
    ['CHECK A RANGE','ARALIGI SINA'],['WAIT FOR DRAIN','TAMPON BOSALT'],['POST A MESSAGE','ILETI GONDER'],['SWAP AT ONCE','ATOMIK DEGISTIR'],
    ['RELEASE LOCKS','KILIDI BIRAK'],['BREAK A CYCLE','DONGUYU KIR'],['CHECK IF READY','HAZIRLIGI SINA']
  ];
  const HOLD_MS=3600, MIN_HOLD_MS=2200, HOP_MS=90, EMPTY_COLUMN_MS=36, LEAD_COLUMNS=3, ENTRY_MS=620, INK_FADE_MS=78;
  function compileSentence(value, round=0) {
    const sentence=transliterate(value), glyphs=[];let width=0;
    for(const letter of sentence){
      if(letter===' '){width+=2;continue;}
      let glyph=COMPACT[letter]||GLYPHS[letter]||COMPACT.O;
      if(letter==='I')glyph=['1','1','1','1','1','1','1'];
      glyphs.push({letter,glyph,left:width,width:glyph[0].length});width+=glyph[0].length+1;
    }
    width=Math.max(1,width-1);
    if(width>52)throw new Error('ActivityNarrator sentence exceeds matrix: '+sentence+' ('+width+')');
    const slack=52-width,left=[0,Math.floor(slack/2),slack][Math.floor(round/2)%3],route=[];
    for(let column=0;column<width;column++){
      const glyph=glyphs.find(item=>column>=item.left&&column<item.left+item.width);
      if(!glyph)continue;
      for(let line=0;line<7;line++){
        const row=column%2?6-line:line;
        if(glyph.glyph[row][column-glyph.left]==='1')route.push({column:left+column,row,index:(left+column)*7+row});
      }
    }
    const buckets=new Map();route.forEach(point=>{if(!buckets.has(point.column))buckets.set(point.column,[]);buckets.get(point.column).push(point);});
    buckets.forEach(bucket=>bucket.forEach((point,index)=>{point.at=point.column+(index+1)/bucket.length;}));
    return {sentence,width,left,route,start:route[0].column,end:route.at(-1).column+1,buckets};
  }
  function createColumnClock(score,next=null) {
    const writerOffset=next?Math.max(LEAD_COLUMNS,score.start+LEAD_COLUMNS-next.start):0;
    const start=score.start,end=Math.max(score.end,next?next.end+writerOffset:score.end),segments=[];
    let duration=0,minHopMs=Infinity;
    for(let column=start;column<end;column++){
      const count=Math.max(score.buckets.get(column)?.length||0,next?.buckets.get(column-writerOffset)?.length||0);
      const span=count?count*HOP_MS:EMPTY_COLUMN_MS;
      segments.push({column,at:duration,span,count});duration+=span;if(count)minHopMs=Math.min(minHopMs,span/count);
    }
    return {start,end,duration,minHopMs,writerOffset,
      frontAt(elapsed){if(elapsed<=0)return start;if(elapsed>=duration)return end;const segment=segments.find(item=>elapsed<item.at+item.span);return segment.column+(elapsed-segment.at)/segment.span;},
      timeAt(front){if(front<=start)return 0;if(front>=end)return duration;const segment=segments[Math.floor(front)-start];return segment.at+(front-segment.column)*segment.span;}
    };
  }
  const SCENES=TOPICS.flatMap((topic,index)=>[0,1].map(language=>({
    lang:language?'TR':'EN',sentence:PHRASES[index%PHRASES.length][language],thoughts:topic[language?3:1],topic:index
  })));
  function mount(options) {
    const {panel,grid,scroll}=options||{};
    if(!panel||!grid||!scroll)throw new Error('ActivityNarrator: panel, grid ve scroll gerekli.');
    if(mounted.has(panel))mounted.get(panel).destroy();
    const hadClass=panel.classList.contains('has-activity-narrator');panel.classList.add('has-activity-narrator');
    const root=element('div','activity-narrator');root.dataset.ready='false';root.dataset.active='false';root.dataset.mode='sentence-relay';
    const tethers=vector('svg',{class:'narrator-tethers','aria-hidden':'true'}),fracture=element('span','narrator-fracture');fracture.setAttribute('aria-hidden','true');root.append(tethers,fracture);
    const helper=element('span','narrator-sr','Tek cümle, iki Luci. İlk yazar cümleyi başlangıçtan silerken diğeri boşalan hücrelere yazar. En az üç sütunluk güvenli aralık korunur; hizalama değişse de önce eski cümle silinmeye başlar. Her cümle tamamlanınca okunur; siyah Luci kimliğini korur. Geçici izler gerçek GitHub kayıtlarını değiştirmez.');
    const announcement=element('span','narrator-sr');announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');root.append(helper,announcement);panel.append(root);
    const media=window.matchMedia('(prefers-reduced-motion: reduce)'),cleanups=[],owners=new Map(),errorInk=[];
    let reduced=Boolean(options.reducedMotion)||media.matches,paused=false,visible=false,destroyed=false;
    let frame=0,layoutFrame=0,previous=0,time=0,dirty=true,points=[],roundIndex=0,cycle=1,serial=1,phase='draw',phaseBorn=0,holdBorn=null;
    let topicOrder=createTopicOrder(-1,true),current=null,incoming=null,writerSide=0,eraseSide=0,eraseFront=-1,writeFront=-1,error=null,errorCount=0,panelFaultUntil=0,collisions=0,relayClock=null,queued=false;
    let box={width:820,size:42,pitch:14,gridTop:200};
    const data=(name,value)=>{const next=String(value);if(root.dataset[name]!==next)root.dataset[name]=next;};
    function listen(target,type,fn,settings){target.addEventListener(type,fn,settings);cleanups.push(()=>target.removeEventListener(type,fn,settings));}
    function entryAt(index){return SCENES[topicOrder[Math.floor(index/2)]*2+index%2];}
    function advanceIndex(){roundIndex=(roundIndex+1)%SCENES.length;if(!roundIndex){topicOrder=createTopicOrder(topicOrder.at(-1));data('cycle',++cycle);}return roundIndex;}
    const actors=[0,1].map(side=>{
      const node=element('div','narrator-character');node.setAttribute('aria-hidden','true');node.dataset.zone=side?'right':'left';node.dataset.color=side?SYNTAX[0]:'black';node.style.setProperty('--luci-body',side?SYNTAX[0]:'#050506');
      const drawing=luci(),shadow=element('span','narrator-shadow');node.append(drawing.svg);root.append(shadow,node);
      return {side,node,drawing,shadow,color:side?SYNTAX[0]:'#ff6a35',current:(side?2:0)*7+6,direction:1};
    });
    const zones=actors.map((actor,side)=>{
      const bubble=element('button','narrator-thought');bubble.type='button';bubble.dataset.zone=side?'right':'left';
      const terminal=element('span','narrator-terminal');terminal.setAttribute('aria-hidden','true');
      const bar=element('span','narrator-terminal-bar'),led=element('i','narrator-led'),label=element('span','narrator-worker'),language=element('span','narrator-language'),status=element('span','narrator-status','READY');bar.append(led,label,language,status);
      const line=element('span','narrator-line'),copy=element('span','narrator-copy'),caret=element('span','narrator-caret','▍');line.append(copy,caret);
      const tip=element('span','narrator-tip','sonraki cümle');terminal.append(bar,line,tip);bubble.append(terminal);
      const tether=vector('path',{});tethers.append(tether);root.append(bubble);
      const zone={side,actor,bubble,copy,label,language,status,tip,tether,text:'',textBorn:0,fullAt:null,bubbleX:0,bubbleY:0,bubbleWidth:250,bubbleHeight:110};
      listen(bubble,'click',()=>{if(reduced||paused){advanceIndex();serial++;reset(true);return;}queued=true;data('queued',true);zones.forEach(item=>{item.tip.textContent='okununca sırada';item.bubble.dataset.queued='true';});});return zone;
    });
    function setThought(side,entry,role){
      const zone=zones[side],text=entry.thoughts[side],same=zone.text===text&&zone.language.textContent===entry.lang;
      if(!same){zone.text=text;zone.textBorn=time;zone.fullAt=null;zone.copy.textContent='';zone.bubble.classList.add('is-typing');}
      zone.language.textContent=entry.lang;zone.label.textContent=side?'luci.color':'luci.black';zone.status.textContent=role;
      zone.bubble.dataset.status=role.toLowerCase();zone.bubble.dataset.lang=entry.lang;zone.bubble.setAttribute('lang',entry.lang.toLowerCase());zone.bubble.style.setProperty('--narrator-accent',actors[side].color);zone.tip.textContent='sonraki cümle';delete zone.bubble.dataset.queued;
      zone.bubble.setAttribute('aria-label',`Düşünce: ${text} Sonraki cümle: hareket durduysa hemen göster; hareketliyse okununca sıraya al.`);
    }
    function thoughts(instant=false){zones.forEach(zone=>{const count=reduced||instant?zone.text.length:Math.min(zone.text.length,Math.max(0,Math.floor((time-zone.textBorn)/34)));zone.copy.textContent=zone.text.slice(0,count);if(count===zone.text.length){if(zone.fullAt===null)zone.fullAt=time;zone.bubble.classList.remove('is-typing');}});}
    function generation(entry,index,side){const score=compileSentence(entry.sentence,index);return {entry,score,clock:createColumnClock(score),side,serial,ink:new Map(),step:0,lastIndex:actors[side].current};}
    function removeInk(record){record.node.remove();owners.delete(record.index);}
    function clearGeneration(g){if(!g)return;g.ink.forEach(removeInk);g.ink.clear();}
    function addInk(g,point){
      if(g.ink.has(point.index))return;
      if(owners.has(point.index)){collisions++;return;}
      const cell=points[point.index]?.cell;if(!cell)return;
      const node=element('span','narrator-ink-layer');node.setAttribute('aria-hidden','true');node.dataset.zone=g.side?'right':'left';node.dataset.sentence=String(g.serial);node.style.background=actors[g.side].color;cell.append(node);
      const record={node,index:point.index,column:point.column,row:point.row,at:point.at};owners.set(point.index,record);g.ink.set(point.index,record);
    }
    function paint(actor,x,y,sx=1,sy=1,tilt=0,arc=0){
      actor.pose={x,y,sx,sy,tilt,arc};
      actor.node.dataset.x=x.toFixed(2);actor.node.dataset.y=y.toFixed(2);actor.node.dataset.cell=String(actor.current);
      const size=box.size;actor.node.style.transform=`translate3d(${(x-size*.5).toFixed(2)}px,${(y-size*.94).toFixed(2)}px,0)`;actor.drawing.svg.style.transform=`rotate(${tilt.toFixed(2)}deg) scale(${(sx*actor.direction).toFixed(3)},${sy.toFixed(3)})`;
      actor.shadow.style.transform=`translate3d(${x.toFixed(2)}px,${(y+arc*Math.min(22,box.pitch*1.4)).toFixed(2)}px,0) scale(${(1-arc*.4).toFixed(2)})`;actor.shadow.style.opacity=String(.4-arc*.2);actor.node.classList.toggle('is-airborne',arc>.1);
      const zone=zones[actor.side],startX=zone.bubbleX+zone.bubbleWidth*.5,startY=zone.bubbleY+zone.bubbleHeight+11,endY=y-size*.8;zone.tether.setAttribute('d',`M${startX.toFixed(1)} ${startY.toFixed(1)}Q${startX.toFixed(1)} ${((startY+endY)*.5).toFixed(1)} ${x.toFixed(1)} ${endY.toFixed(1)}`);
    }
    function gaze(actor,dx,dy){actor.drawing.pupil.setAttribute('cx',(54+clamp(dx/60*actor.direction,-3,3)).toFixed(2));actor.drawing.pupil.setAttribute('cy',(47+clamp(dy/55,-2,2)).toFixed(2));}
    function idle(actor){const p=points[actor.current];if(p){const zone=zones[actor.side];gaze(actor,zone.bubbleX+zone.bubbleWidth*.5-p.x,zone.bubbleY-p.y);paint(actor,p.x,p.y);}}
    function hopBetween(actor,a,b,progress,warning=false){
      if(!a||!b)return;const travel=progress*progress*(3-2*progress),arc=Math.sin(Math.PI*progress);actor.direction=b.x===a.x?actor.direction:b.x>a.x?1:-1;gaze(actor,b.x-a.x,b.y-a.y);
      const distance=Math.hypot(b.x-a.x,b.y-a.y),height=Math.min(box.size*.52,Math.max(box.pitch*.78,distance*.14))*(warning?1.15:1);paint(actor,a.x+(b.x-a.x)*travel,a.y+(b.y-a.y)*travel-arc*height,1-arc*.045,1+arc*.065,actor.direction*arc*(warning?12:7),arc);
    }
    function hop(actor,from,to,progress,warning=false){hopBetween(actor,points[from],points[to],progress,warning);}
    function pose(actor,saved){if(saved)paint(actor,saved.x,saved.y,saved.sx,saved.sy,saved.tilt,saved.arc);else idle(actor);}
    function actorAtFront(actor,route,front){
      if(!route.length){idle(actor);return;}
      const column=Math.floor(front),bucket=route.filter(point=>point.column===column),prior=route.filter(point=>point.column<column).at(-1);
      if(!bucket.length){if(prior){actor.current=prior.index;idle(actor);}else pose(actor,actor.routeOrigin);return;}
      const progress=clamp(front-column,0,.999)*bucket.length,step=Math.floor(progress),from=step?bucket[step-1]:prior;
      hopBetween(actor,from?points[from.index]:actor.routeOrigin||points[actor.current],points[bucket[step].index],progress-step);if(step)actor.current=bucket[step-1].index;
    }
    function updateWrite(g,front){
      while(g.step<g.score.route.length){const point=g.score.route[g.step];if(point.at>front)break;if(owners.has(point.index)&&!g.ink.has(point.index))break;addInk(g,point);actors[g.side].current=point.index;g.step++;}
      actorAtFront(actors[g.side],g.score.route,front);
    }
    function beginHold(){phase='hold';phaseBorn=time;holdBorn=time;current.step=current.score.route.length;eraseFront=writeFront=current.score.end;current.score.route.forEach(point=>addInk(current,point));actors[current.side].current=current.score.route.at(-1).index;actors.forEach(actor=>{actor.routeOrigin=null;});zones.forEach(zone=>{zone.status.textContent='READ';zone.bubble.dataset.status='read';});announcement.textContent=`${current.entry.lang}. ${current.entry.sentence}.`;}
    function reset(instant=false){
      clearGeneration(current);clearGeneration(incoming);owners.clear();errorInk.splice(0).forEach(record=>record.node.remove());error=null;panelFaultUntil=0;panel.classList.remove('narrator-has-warning');root.classList.remove('is-faulting');actors.forEach(actor=>actor.node.classList.remove('is-warning'));
      writerSide=roundIndex%2;eraseSide=1-writerSide;queued=false;delete root.dataset.queued;relayClock=null;actors.forEach(actor=>{actor.routeOrigin=null;});
      if(writerSide===1){const color=SYNTAX[Math.floor(roundIndex/2)%SYNTAX.length];actors[1].color=color;actors[1].node.dataset.color=color;actors[1].node.style.setProperty('--luci-body',color);}
      current=generation(entryAt(roundIndex),roundIndex,writerSide);incoming=null;phase=instant?'hold':'draw';phaseBorn=time;holdBorn=null;eraseFront=writeFront=-1;
      zones.forEach(zone=>setThought(zone.side,current.entry,zone.side===writerSide?'WRITE':'READY'));if(instant){thoughts(true);beginHold();}dirty=true;queueMeasure();diagnostics();
    }
    function beginRelay(){
      eraseSide=current.side;writerSide=1-eraseSide;advanceIndex();serial++;
      if(writerSide===1){const color=SYNTAX[Math.floor(roundIndex/2)%SYNTAX.length];actors[1].color=color;actors[1].node.dataset.color=color;actors[1].node.style.setProperty('--luci-body',color);}
      incoming=generation(entryAt(roundIndex),roundIndex,writerSide);relayClock=createColumnClock(current.score,incoming.score);current.ink.forEach(record=>{record.eraseAt=relayClock.timeAt(record.at);});
      phase='handoff';phaseBorn=time;eraseFront=writeFront=-1;queued=false;delete root.dataset.queued;
      actors.forEach(actor=>{actor.entryFrom=actor.pose||points[actor.current];});
      const first=points[incoming.score.route[0].index];actors[writerSide].routeOrigin={x:clamp(first.x-box.pitch*2.1,box.size*.6,box.width-box.size*.6),y:first.y+box.pitch*2};
      actors[eraseSide].routeOrigin=null;setThought(eraseSide,current.entry,'ERASE');setThought(writerSide,incoming.entry,'WRITE');
    }
    function errorPath(){
      const actor=actors[writerSide],col=Math.floor(actor.current/7),row=actor.current%7,result=[];
      for(let distance=1;distance<6;distance++)for(let dc=-distance;dc<=distance;dc++)for(let dr=-distance;dr<=distance;dr++){
        const c=col+dc,r=row+dr,index=c*7+r;if(c<0||c>=52||r<0||r>6||owners.has(index)||result.includes(index))continue;
        if(Math.max(Math.abs(dc),Math.abs(dr))!==distance)continue;result.push(index);if(result.length===3)return result;
      }return result;
    }
    function startError(){
      const route=errorPath();if(route.length<3)return;
      error={born:time,route,origin:actors[writerSide].current,pose:actors[writerSide].pose,eraserPose:actors[eraseSide].pose,step:0};errorCount++;const zone=zones[writerSide];zone.status.textContent='WARN';zone.bubble.dataset.status='warn';zone.actor.node.classList.add('is-warning');panelFaultUntil=time+900;panel.classList.add('narrator-has-warning');root.classList.add('is-faulting');const point=points[route[0]];if(point)root.style.setProperty('--fault-y',point.y.toFixed(1)+'px');
    }
    function markError(index){const cell=points[index]?.cell;if(!cell)return;const node=element('span','narrator-error-ink');node.setAttribute('aria-hidden','true');cell.append(node);errorInk.push({node,born:time,index});}
    function updateError(){
      const elapsed=time-error.born,actor=actors[writerSide];
      if(elapsed<510){const step=Math.min(2,Math.floor(elapsed/170));while(error.step<step){markError(error.route[error.step]);actor.current=error.route[error.step++];}hopBetween(actor,step?points[error.route[step-1]]:error.pose,points[error.route[step]],clamp((elapsed-step*170)/170,0,1),true);}
      else if(elapsed<790){while(error.step<3)markError(error.route[error.step++]);zones[writerSide].status.textContent='RECOVER';zones[writerSide].bubble.dataset.status='recover';hopBetween(actor,points[error.route[2]],error.pose,clamp((elapsed-510)/280,0,1),true);}
      else{actor.current=error.origin;phaseBorn+=time-error.born;pose(actor,error.pose);zones[writerSide].status.textContent='WRITE';zones[writerSide].bubble.dataset.status='write';actor.node.classList.remove('is-warning');}
      pose(actors[eraseSide],error.eraserPose);if(elapsed>=790)error=null;
    }
    function update(){
      thoughts();
      for(let i=errorInk.length-1;i>=0;i--){const record=errorInk[i],age=time-record.born;record.node.style.opacity=String(clamp(1-(age-600)/700,0,1));if(age>=1300){record.node.remove();errorInk.splice(i,1);}}
      if(panelFaultUntil&&time>=panelFaultUntil){panelFaultUntil=0;panel.classList.remove('narrator-has-warning');root.classList.remove('is-faulting');}
      if(error){updateError();diagnostics();return;}
      const elapsed=time-phaseBorn;
      if(phase==='draw'){
        writeFront=current.clock.frontAt(elapsed);updateWrite(current,writeFront);idle(actors[1-current.side]);if(elapsed>=current.clock.duration)beginHold();
      }else if(phase==='hold'){
        actors.forEach(idle);const readable=zones.every(zone=>zone.fullAt!==null&&time-zone.fullAt>=READ_MS);
        if(time-holdBorn>=(queued?MIN_HOLD_MS:HOLD_MS)&&readable)beginRelay();
      }else if(phase==='handoff'){
        const progress=clamp(elapsed/ENTRY_MS,0,1);hopBetween(actors[eraseSide],actors[eraseSide].entryFrom,points[current.score.route[0].index],progress);hopBetween(actors[writerSide],actors[writerSide].entryFrom,actors[writerSide].routeOrigin,progress);
        if(progress===1){actors[eraseSide].current=current.score.route[0].index;phase='relay';phaseBorn=time;eraseFront=relayClock.start;writeFront=eraseFront-relayClock.writerOffset;current.errorPlanned=serial%5===0;}
      }else if(phase==='relay'){
        eraseFront=relayClock.frontAt(elapsed);writeFront=eraseFront-relayClock.writerOffset;
        // The old line starts erasing before the incoming line can land.
        // A minimum three-column gap protects ownership even across alignment changes.
        current.ink.forEach((record,index)=>{const opacity=clamp(1-(elapsed-record.eraseAt)/INK_FADE_MS,0,1);record.node.style.opacity=opacity.toFixed(3);if(opacity===0){removeInk(record);current.ink.delete(index);}});
        actorAtFront(actors[eraseSide],current.score.route,eraseFront);updateWrite(incoming,writeFront);
        if(current.errorPlanned&&elapsed>=relayClock.duration*.48){current.errorPlanned=false;startError();}
        if(elapsed>=relayClock.duration+INK_FADE_MS){clearGeneration(current);current=incoming;incoming=null;beginHold();}
      }
      diagnostics();
    }
    function diagnostics(){
      data('writeOffsetColumns',relayClock?.writerOffset??LEAD_COLUMNS);
      data('phase',error?'warn':phase);data('phaseElapsed',Math.round(time-phaseBorn));data('actors',2);data('round',roundIndex+1);data('cycle',cycle);data('lang',(incoming||current).entry.lang);data('message',(incoming||current).entry.sentence);data('oldSentence',current.entry.sentence);data('nextSentence',incoming?.entry.sentence||'');
      data('bankSize',SCENES.length);data('topicCount',TOPICS.length);data('thoughtCount',SCENES.length*2);data('holdMs',HOLD_MS);data('minHoldMs',MIN_HOLD_MS);data('readMs',READ_MS);data('leadColumns',LEAD_COLUMNS);data('hopMs',HOP_MS);data('actualHopMs',(relayClock||current.clock).minHopMs);data('emptyColumnMs',EMPTY_COLUMN_MS);data('drawDurationMs',current.clock.duration);data('relayDurationMs',relayClock?relayClock.duration+INK_FADE_MS:0);data('scoreStart',current.score.start);data('scoreEnd',current.score.end);data('nextScoreStart',incoming?.score.start??'');data('nextScoreEnd',incoming?.score.end??'');data('collisions',collisions);data('errorCount',errorCount);data('error',error?'warn':errorInk.length?'recover':'none');data('eraseFront',eraseFront.toFixed(3));data('writeFront',writeFront.toFixed(3));data('writer',writerSide?'color':'black');data('eraser',eraseSide?'color':'black');data('serial',serial);data('elapsed',Math.round(time));data('holdElapsed',holdBorn===null?0:Math.round(time-holdBorn));data('inkCount',owners.size);data('oldInk',current.ink.size);data('newInk',incoming?.ink.size||0);
      zones.forEach(zone=>{const key=zone.side?'right':'left';data(key+'Body',zone.side?actors[1].color:'#050506');data(key+'Role',zone.bubble.dataset.status);data(key+'Lang',zone.language.textContent);data(key+'ReadMs',zone.fullAt===null?0:Math.round(time-zone.fullAt));data(key+'Thought',zone.text);});
    }
    function measure(){
      dirty=false;const panelRect=panel.getBoundingClientRect(),gridRect=grid.getBoundingClientRect();points=[...grid.querySelectorAll('.rhythm-cell')].map(cell=>{const rect=cell.getBoundingClientRect();return {cell,x:rect.left+rect.width/2-panelRect.left,y:rect.top+rect.height*.65-panelRect.top};});
      box={width:panel.clientWidth,size:actors[0].node.offsetWidth||42,pitch:gridRect.width/52,gridTop:gridRect.top-panelRect.top};const bubbleWidth=Math.min(280,Math.max(100,gridRect.width*.5-8));
      zones.forEach(zone=>{zone.bubble.style.width=bubbleWidth.toFixed(2)+'px';zone.bubbleWidth=bubbleWidth;zone.bubbleHeight=zone.bubble.offsetHeight;const center=gridRect.left-panelRect.left+gridRect.width*(zone.side?.76:.24);zone.bubbleX=clamp(center-bubbleWidth/2,8,Math.max(8,box.width-bubbleWidth-8));zone.bubbleY=Math.max(14,box.gridTop-zone.bubbleHeight-35);zone.bubble.style.transform=`translate3d(${zone.bubbleX.toFixed(2)}px,${zone.bubbleY.toFixed(2)}px,0)`;idle(zone.actor);});
      data('ready',points.length===364);root.style.setProperty('--narrator-grid-top',box.gridTop.toFixed(2)+'px');
    }
    function activeMotion(){return !destroyed&&!paused&&!reduced&&visible&&!document.hidden&&points.length===364;}
    function queueMeasure(){dirty=true;if(!frame&&!layoutFrame&&!destroyed)layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;measure();sync();});}
    function tick(now){frame=0;if(dirty)measure();if(!activeMotion()){sync();return;}time+=previous?Math.min(50,now-previous):0;previous=now;update();frame=requestAnimationFrame(tick);}
    function sync(){const on=activeMotion();data('active',on);data('reduced',reduced);if(on&&!frame){previous=0;frame=requestAnimationFrame(tick);}if(!on){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}}
    function inViewport(){const rect=panel.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight;}
    function changeMotion(event){reduced=event.matches;reset(reduced);measure();diagnostics();sync();}
    listen(scroll,'scroll',queueMeasure,{passive:true});listen(window,'resize',queueMeasure,{passive:true});listen(document,'visibilitychange',sync);
    if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queueMeasure();sync();},{threshold:.02});io.observe(panel);cleanups.push(()=>io.disconnect());}else listen(window,'scroll',()=>{visible=inViewport();queueMeasure();sync();},{passive:true});
    if('ResizeObserver'in window){const ro=new ResizeObserver(queueMeasure);[panel,grid,scroll,...zones.map(zone=>zone.bubble)].forEach(node=>ro.observe(node));cleanups.push(()=>ro.disconnect());}
    const mo=new MutationObserver(queueMeasure);mo.observe(grid,{childList:true});cleanups.push(()=>mo.disconnect());if(media.addEventListener)listen(media,'change',changeMotion);else if(media.addListener){media.addListener(changeMotion);cleanups.push(()=>media.removeListener(changeMotion));}
    visible=inViewport();reset(reduced);measure();if(reduced)beginHold();diagnostics();sync();
    const api=Object.freeze({setPaused(value){paused=Boolean(value);sync();},destroy(){if(destroyed)return;destroyed=true;sync();if(layoutFrame)cancelAnimationFrame(layoutFrame);cleanups.forEach(cleanup=>cleanup());clearGeneration(current);clearGeneration(incoming);errorInk.splice(0).forEach(record=>record.node.remove());actors.forEach(actor=>{actor.node.remove();actor.shadow.remove();});root.remove();panel.classList.remove('narrator-has-warning');if(!hadClass)panel.classList.remove('has-activity-narrator');mounted.delete(panel);}});mounted.set(panel,api);return api;
  }
  window.ActivityNarrator=Object.freeze({mount});
})();
