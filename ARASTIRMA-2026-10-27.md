# Zamanlama ve LinuxOfficial incelemesi — 27 Ekim 2026

Önce bilgisayar ve Luci düzeltmeleri tamamlandı. Sonra [LinuxOfficial](https://linuxofficial.com/) canlı tarayıcıda masaüstünde ve 390 × 844 görünümde incelendi. Önceki kaynaklar [motion araştırmasında](MOTION-ARASTIRMA.md) ve [ilk araştırma kaydında](ARASTIRMA.md) korunuyor.

## Tamamlanan zamanlama düzeltmeleri

Bilgisayarın dış döngüsü, içerideki iş tamamlanmadan değişiyordu. Yeni davranışta başlangıç, işlem ve sonuç okuması sahneyi korur. Her ziyaret tek kısa bölüm tamamlar: kimlik komutu, gerçek SQLite JOIN veya sürüm/şema. Hazır sonuçtan sonra 3,4–3,6 saniyelik okuma başlar; yükleme bu süreyi tüketmez. Elle sahne seçimi önceliklidir. Monitörün üzerinden geçmek otomasyonu kalıcı iptal etmez; gerçek girdi kontrolü alır.

Düşük kare hızında mantıksal saatlerin 50 ms ile kırpılması süreleri uzatıyordu. Sunumun aktif zamanı artık kare başına en çok 1000 ms ilerler; oyunların fizik adımı 50 ms kalır. Gizlenme, ekran dışı durum ve duraklatma sırasında geçen zaman sonuç okumasından düşmez. Geç gelen manuel sonuç kendi yeni okuma süresini kazanır.

Luci'nin ortak yoğunluk saatinde gerçek basış en az 90 ms, boş sütun 36 ms'dir. Yazıcı ofseti `max(3, eskiBaşlangıç + 3 − yeniBaşlangıç)` ile hesaplanır: yeni yazı, eski cümlenin başlangıcı sönmeye başladıktan sonra gelir. En az üç sütunluk aralık, 78 ms hücre sönümünü korur. Gereksiz boş kenar taraması kalktı.

Tam cümle normalde 3,6 saniye okunur. Sıra düğmesi beklemeyi en az 2,2 saniyeye indirebilir; düşüncelerin 5 saniyelik okunma sınırı ve cümlenin tamamlanması yine beklenir. Tek istek bir kez tüketilir; duraklatılmışken elle ilerlemek tam ve sabit cümle gösterir. Silenin düşüncesi yeniden yazılmaz. İki karakter devirde farklı yaklaşma noktalarından gelir. WARN gerçek görünür pozdan başlar, diğer karakterin pozunu da dondurur ve aynı yere döner.

## Gerçekten çalıştırılan referans durumları

| Durum | Gözlem | Portföye dönük karar |
| --- | --- | --- |
| Masaüstü açılış | Büyük siyah başlık, hafif tekrar eden teknik metin dokusu, turuncu vurgu, çizgiler ve kenar kimliği | Başlık ve küçük teknik bilgiyi aynı dilde tutmak; mevcut sıcak/koyu palet ve kendi geometrimiz korunur. |
| Türkçe/İngilizce | Dil düğmeleri başlık, gövde ve notları değiştiriyor; hiyerarşi kalıyor | Gelecekte çeviri eklenirse sözcük bütünlüğünü ve yerleşimi korumak. Bu turda genel dil sistemi eklenmedi. |
| Açılır not | Bir tarihli satır açıldı; koyu seçili satırın altında içerik ve ince turuncu çizgi belirdi | Ayrıntıyı aynı bağlamda açmak; mevcut yetenek/teknik ayrıntı yapılarıyla karşılaştırmak. |
| Konsol | `help` gönderildi; Yukarı ile geçmiş geldi; `wh` + Tab, `whoami` olarak tamamlandı | Mevcut küçük Terminal'e sınırlı komut geçmişi ve tek eşleşmeli tamamlama uyarlamak. |
| Genel kısayol | Kısayol denendi; dar görünümde altta sabit konsol paneli görüldü ve kapatıldı | Yeni genel tuş yakalama eklemek yerine bu turda iyileştirmeyi Terminal'in kendi girdisinde tutmak. |
| Dar görünüm | Başlık alta yerleşiyor; not tablosunda tarih/etiket geri çekilip başlık ve içerik kalıyor. Yatay sayfa taşması gözlenmedi. | Dar ekranda anlam taşıyan başlık ve eylemi korumak; kendi 44 px kontrollerimizi küçültmemek. |
| Kapanış | Kısa kimlik, ayırıcı çizgi ve yıl; aynı sayfanın sonuna kadar akış | Her bölümde yeni bir görsel tema kurmadan anlatımı kapatmak. |

Satın alma, indirme veya hesap girişi yapılmadı. Ağ sorgulu konum ve parola araçları çalıştırılmadı. Referansın kaynak kodu, görseli veya metni dağıtım paketine alınmadı. Araştırma ekran görüntüleri geliştirme çalışma alanındadır.

## Doğrulama

Luci için 27.936 eşleşmiş/cross-topic ve hizalama geçişi kontrol edildi: başlangıçtan silme sırası, sahiplik, en az 90 ms basış ve en az üç sütun aralığı geçiyor. Hesaplanan devirler 12,456–25,290 saniye arasında. WARN, duraklatılmış elle ilerleme, canlı hareket tercihi ve temizleme ayrıca sınanır.

Bilgisayarda 32 uygulama, gerçek SQLite, geciken hazır olma/sonuç, hata sınırı, kullanıcı müdahalesi ve yaşam döngüsü kontrol edildi. 500 ms kareli testte okuma süresi sonuç hazır olduktan sonra tam başlar; 20 saniyelik duraklatma bunu tüketmez. Bunlar davranış kontrolleridir; cihazlar arası FPS veya batarya ölçümü değildir.
