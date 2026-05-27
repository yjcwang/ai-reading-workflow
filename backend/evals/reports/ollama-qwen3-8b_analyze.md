[CASE] n2_001
  latency: 36.92s
  Grammar
    expected:    ['おかげで', 'からといって', 'ものの']
    actual norm: ['おかげで', 'からといって', 'てくる', 'ものの']
    missing:     []
    extra:       ['てくる']
    metrics:     matched=3, precision=0.75, recall=1.00, f1=0.86
  Vocab
    expected:    ['丁寧', '慣れる', '職場', '自信をなくす']
    actual norm: ['丁寧に', '先輩', '分からない', '失敗', '必要はない', '慣れてきた', '新しい職場', '自信をなくす']
    missing:     ['丁寧', '慣れる', '職場']
    extra:       ['丁寧に', '先輩', '分からない', '失敗', '必要はない', '慣れてきた', '新しい職場']
    metrics:     matched=1, precision=0.12, recall=0.25, f1=0.17

[CASE] n2_002
  latency: 52.27s
  Grammar
    expected:    ['ざるを得ない', 'とたん', 'とは思ってもみなかった']
    actual norm: ['ざるを得ない', 'ため', 'とたん', 'とは思う', 'に着いた', '思ってもみない']
    missing:     ['とは思ってもみなかった']
    extra:       ['ため', 'とは思う', 'に着いた', '思ってもみない']
    metrics:     matched=2, precision=0.33, recall=0.67, f1=0.44
  Vocab
    expected:    ['ざるを得ない', '降り出す']
    actual norm: ['傘', '友人', '店', '昔', '雨', '駅']
    missing:     ['ざるを得ない', '降り出す']
    extra:       ['傘', '友人', '店', '昔', '雨', '駅']
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00

[CASE] n2_003
  latency: 29.42s
  Grammar
    expected:    ['だけでなく', 'に関して', 'べき', '一方で']
    actual norm: ['ことが求められている', 'すべき', 'だけでなく、～も～', 'として～（こと）が～']
    missing:     ['だけでなく', 'に関して', 'べき', '一方で']
    extra:       ['ことが求められている', 'すべき', 'だけでなく、～も～', 'として～（こと）が～']
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  Vocab
    expected:    ['改善', '求められる', '生活環境', '行政', '観光地']
    actual norm: ['住民', '協力', '地域の人々', '改善', '生活環境', '行政', '観光地']
    missing:     ['求められる']
    extra:       ['住民', '協力', '地域の人々']
    metrics:     matched=4, precision=0.57, recall=0.80, f1=0.67

[CASE] n2_004
  latency: 32.11s
  Grammar
    expected:    ['にもかかわらず', 'ようだ', 'ようになってきた']
    actual norm: ['にもかかわらず', 'の結果', 'ようになってきた']
    missing:     ['ようだ']
    extra:       ['の結果']
    metrics:     matched=2, precision=0.67, recall=0.67, f1=0.67
  Vocab
    expected:    ['努力', '欠かさず', '結果']
    actual norm: ['ようだ', '努力', '忙しい', '日本語', '欠かさず', '毎日', '読める', '難しい']
    missing:     ['結果']
    extra:       ['ようだ', '忙しい', '日本語', '毎日', '読める', '難しい']
    metrics:     matched=2, precision=0.25, recall=0.67, f1=0.36

[CASE] n2_005
  latency: 34.77s
  Grammar
    expected:    ['たほうがよい', 'ためには', 'だけに', 'とともに']
    actual norm: ['だけに', 'ともに', 'ほうがよい', 'を先に述べる', '注意する必要がある']
    missing:     ['たほうがよい', 'ためには', 'とともに']
    extra:       ['ともに', 'ほうがよい', 'を先に述べる', '注意する必要がある']
    metrics:     matched=1, precision=0.20, recall=0.25, f1=0.22
  Vocab
    expected:    ['発言', '簡潔', '結論', '表情', '誤解', '述べる']
    actual norm: ['オンライン会議', '発言', '簡潔', '結論', '誤解']
    missing:     ['表情', '述べる']
    extra:       ['オンライン会議']
    metrics:     matched=4, precision=0.80, recall=0.67, f1=0.73

[CASE] n2_006
  latency: 28.14s
  Grammar
    expected:    ['ことがある', 'ことになっている', 'なしに', 'までに']
    actual norm: ['ことがある', 'ことになっている', 'なしに', '場合']
    missing:     ['までに']
    extra:       ['場合']
    metrics:     matched=3, precision=0.75, recall=0.75, f1=0.75
  Vocab
    expected:    ['受け付ける', '来店']
    actual norm: ['予約', '前日', '受け付け', '変更', '来店', '次回', '連絡']
    missing:     ['受け付ける']
    extra:       ['予約', '前日', '受け付け', '変更', '次回', '連絡']
    metrics:     matched=1, precision=0.14, recall=0.50, f1=0.22

[CASE] n2_007
  latency: 25.75s
  Grammar
    expected:    ['ことなく', '恐れがある', '際に']
    actual norm: ['が～ない場合', 'で～することなく', '恐れがある', '際には']
    missing:     ['ことなく', '際に']
    extra:       ['が～ない場合', 'で～することなく', '際には']
    metrics:     matched=1, precision=0.25, recall=0.33, f1=0.29
  Vocab
    expected:    ['医師', '症状', '相談', '自己判断']
    actual norm: ['医師', '症状', '眠くなる', '自己判断']
    missing:     ['相談']
    extra:       ['眠くなる']
    metrics:     matched=3, precision=0.75, recall=0.75, f1=0.75

[CASE] n2_008
  latency: 35.93s
  Grammar
    expected:    ['ことになりかねない', 'だけでなく', 'にあたって', 'まま']
    actual norm: ['だけでなく', 'ておく', 'と', 'なりかねない', 'にあたって', 'についても', 'まま']
    missing:     ['ことになりかねない']
    extra:       ['ておく', 'と', 'なりかねない', 'についても']
    metrics:     matched=3, precision=0.43, recall=0.75, f1=0.55
  Vocab
    expected:    ['なりかねない', '不十分', '住まい', '現地', '生活費']
    actual norm: ['住まい', '保険', '出発', '困る', '準備', '生活費', '留学する']
    missing:     ['なりかねない', '不十分', '現地']
    extra:       ['保険', '出発', '困る', '準備', '留学する']
    metrics:     matched=2, precision=0.29, recall=0.40, f1=0.33

Summary
Analyzer provider: ollama
Analyzer model:    qwen3:8b
Average latency:   34.42s
Grammar average precision: 0.42
Grammar average recall:    0.55
Grammar average f1:        0.47
Vocab average precision: 0.37
Vocab average recall:    0.50
Vocab average f1:        0.40