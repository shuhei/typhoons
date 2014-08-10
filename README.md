# 地図の変換方法

データは http://www.naturalearthdata.com/ から取得する。
今回使うのは units と populated places。

Shape file をこの方法で TopoJSON に変換する。 http://bost.ocks.org/mike/map/
TopoJSON は GeoJSON の拡張。容量を節約できる。多分、国境などをシェアできるため？

## 必要な国はどこ？

日本、中国、韓国、北朝鮮、台湾、インドネシア、フィリピン、マレーシア、タイ、ベトナム、カンボジア、ラオス、モンゴル、ロシア。

ISO 3166-1 alpha-3 による国コード。 http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3

JPN
TWN
CHN
KOR
PRK
IDN
PHL
MYS
THA
VNM
KHM
LAO
MNG
RUS

## 変換

### Shapefile to GeoJSON

コマンドラインで使う shp だけではダメで、一緒にダウンロードした shx, dbf, prj ファイルも一緒にないとだめ。これで数時間はまった。

```
ogr2ogr -f GeoJSON -where "ADM0_A3 IN ('JPN', 'TWN', 'CHN', 'KOR', 'PRK', 'IDN', 'PHL', 'MYS', 'THA', 'VNM', 'KHM', 'LAO', 'MNG', 'RUS')" subunits.json ne_50m_admin_0_map_subunits.shp
```

ちなみに中身のデータは ogrinfo というコマンドで見られる。

```
ogrinfo -al ne_50m_admin_0_map_subunits.shp
```

確認したところ populates_places にも ADM0_A3 があったので、チュートリアルとは変えてこっちを使う。

```
ogr2ogr -f GeoJSON -where "ADM0_A3 IN ('JPN', 'TWN', 'CHN', 'KOR', 'PRK', 'IDN', 'PHL', 'MYS', 'THA', 'VNM', 'KHM', 'LAO', 'MNG', 'RUS') AND SCALERANK < 8" places.json ne_50m_populated_places_simple.shp
```

不要な領域をクリッピングできるらしいので、必要があればクリッピングしてもいいかも。

### GeoJSON to TopoJSON

```
topojson -o east-asia.json --id-property SU_A3 --properties name=NAME -- subunits.json places.json
```

## QGIS

Mac で使える GIS 系のソフト。Shapefile のカラム名を見たい時など。
http://qgis.org/en/site/

Homebrew を使って入れるには https://github.com/OSGeo/homebrew-osgeo4mac を利用する。本家に入っているのは 1.8 と古いバージョン。2.4 を入れるには以下。すごく時間がかかる。

よくわからないが、grass の make でこけてうまくいかないので、いらなさそうなのを除外。 https://github.com/OSGeo/homebrew-osgeo4mac/issues/45 を参考に・・・。

```
brew tap osgeo/osgeo4mac
brew install qgis-24 --without-globe --without-server --without-grass
```

と思ったけど、まともに動かず。試すのにも時間がかかるし、バイナリを入れることにしよう。

http://www.kyngchaos.com/software/frameworks から GDAL 1.11 Complete をダウンロードしインストール。同梱されている NumPy も。

さらに http://www.kyngchaos.com/software/python から matplotlib をダウンロード、インストール。

# 気象庁のデータ

[気象庁のデータ](http://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html) を使う。

新しいデータは画像だけ。予報のデータも置いておいてくれればいいのに。

新しい情報だけ別ので補う？[米軍のとか](http://www.usno.navy.mil/JTWC/)。しかし、これもいまいちセマンティックではない。

欲しいデータ形式は以下。

```json
[
  {
    "year": 1981, // 年
    "number": 1, // データ番号。いらないかも？
    "maxwind": 10, // その台風の最大風速
    "position": [
      {
        "date": "1981-07-30 15:00:00",
        "pressure": 1000,
        "lat": 10.0,
        "lon": 20.0,
        "maxwind": 10
      }
    ]
  }
]
```

# データがおかしい
position が何故かずれている。12 月から始まり、次が 1 月になっている。おかしい。

Ruby のスクリプトの中でソートした。

それでも、おかしな箇所あり。2000 年は 1, 12 月にまたがるデータあり。前か次の年のものが含まれていると考えられる。
これはどうするか？選択肢は二つ。

- 一つの台風を分割する。
- データ構造を変え、年は関係ない台風の配列とする。こっちの方が、やりやすい意味はあるが、チャートの方ではやはり二つに分割しておく必要あり。

# d3

## call

知らなかったけど、コード再利用のための仕組み。call に関数を渡すと第一引数に d3 要素？が入ってくるので、それに対していろいろできる。

別になくてもいいけど、call があると、メソッドチェーンで書ける。

```js
function position(elem) {
  elem
    .attr('x', function(d) { return d.x; })
    .attr('y', function(d) { return d.y; });
}

d3.select('.small-rects').append('rect')
  .attr('width', 10)
  .attr('height', 10)
  .call(position);

d3.select('.large-rects').append('rect')
  .attr('width', 100)
  .attr('height', 100)
  .call(position);
```

# TODOs

- 地図を、他の国も入れる。
- 通しのチャートを作る。各年を縦軸。横が月。風速で大きさと、期間。d3 の方が簡単そう。
