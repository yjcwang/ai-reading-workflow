[CASE] n2_001
  latency: 7.25s
  Grammar
    expected:    ['おかげで', 'からといって', 'ものの']
    actual norm: ['おかげで', 'からといって', 'ものの']
    missing:     []
    extra:       []
    metrics:     matched=3, precision=1.00, recall=1.00, f1=1.00
  Vocab
    expected:    ['丁寧', '慣れる', '職場', '自信をなくす']
    actual norm: ['なくす', '丁寧', '先輩', '慣れる', '職場', '自信']
    missing:     ['自信をなくす']
    extra:       ['なくす', '先輩', '自信']
    metrics:     matched=3, precision=0.50, recall=0.75, f1=0.60

[CASE] n2_002
  latency: 6.71s
  Grammar
    expected:    ['ざるを得ない', 'とたん', 'とは思ってもみなかった']
    actual norm: ['ざるを得ない', 'たとたん', 'とは思ってもみなかった']
    missing:     ['とたん']
    extra:       ['たとたん']
    metrics:     matched=2, precision=0.67, recall=0.67, f1=0.67
  Vocab
    expected:    ['ざるを得ない', '降り出す']
    actual norm: ['会うとは思ってもみなかった', '入らざるを得なかった', '持っていなかった', '着いたとたん', '降り出した']
    missing:     ['ざるを得ない', '降り出す']
    extra:       ['会うとは思ってもみなかった', '入らざるを得なかった', '持っていなかった', '着いたとたん', '降り出した']
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00

[CASE] n2_003
  latency: 6.40s
  Grammar
    expected:    ['だけでなく', 'に関して', 'べき', '一方で']
    actual norm: ['ことが求められている', 'すべき', 'だけでなく', 'に関して', '一方で']
    missing:     ['べき']
    extra:       ['ことが求められている', 'すべき']
    metrics:     matched=3, precision=0.60, recall=0.75, f1=0.67
  Vocab
    expected:    ['改善', '求められる', '生活環境', '行政', '観光地']
    actual norm: ['住民', '協力', '地域', '改善', '求められている', '生活環境', '知られている', '行政', '観光地']
    missing:     ['求められる']
    extra:       ['住民', '協力', '地域', '求められている', '知られている']
    metrics:     matched=4, precision=0.44, recall=0.80, f1=0.57

[CASE] n2_004
  latency: 5.04s
  Grammar
    expected:    ['にもかかわらず', 'ようだ', 'ようになってきた']
    actual norm: ['にもかかわらず', 'ようになってきた']
    missing:     ['ようだ']
    extra:       []
    metrics:     matched=2, precision=1.00, recall=0.67, f1=0.80
  Vocab
    expected:    ['努力', '欠かさず', '結果']
    actual norm: ['努力', '文章', '欠かさず', '結果']
    missing:     []
    extra:       ['文章']
    metrics:     matched=3, precision=0.75, recall=1.00, f1=0.86

[CASE] n2_005
  latency: 8.19s
  Grammar
    expected:    ['たほうがよい', 'ためには', 'だけに', 'とともに']
    actual norm: ['たほうがよい', 'だけに', 'とともに']
    missing:     ['ためには']
    extra:       []
    metrics:     matched=3, precision=1.00, recall=0.75, f1=0.86
  Vocab
    expected:    ['発言', '簡潔', '結論', '表情', '誤解', '述べる']
    actual norm: ['オンライン会議', '仕方', '必要', '注意する', '理由', '発言', '簡潔', '結論', '表情', '見えにくい', '誤解', '説明する', '述べる', '避ける']
    missing:     []
    extra:       ['オンライン会議', '仕方', '必要', '注意する', '理由', '見えにくい', '説明する', '避ける']
    metrics:     matched=6, precision=0.43, recall=1.00, f1=0.60

[CASE] n2_006
  latency: 5.50s
  Grammar
    expected:    ['ことがある', 'ことになっている', 'なしに', 'までに']
    actual norm: ['ことがある', 'ことになっている']
    missing:     ['なしに', 'までに']
    extra:       []
    metrics:     matched=2, precision=1.00, recall=0.50, f1=0.67
  Vocab
    expected:    ['受け付ける', '来店']
    actual norm: ['予約', '前日', '受け付ける', '変更', '来店', '次回', '連絡']
    missing:     []
    extra:       ['予約', '前日', '変更', '次回', '連絡']
    metrics:     matched=2, precision=0.29, recall=1.00, f1=0.44

[CASE] n2_007
  latency: 7.63s
  Grammar
    expected:    ['ことなく', '恐れがある', '際に']
    actual norm: ['ことなく', '恐れがある', '際（に）']
    missing:     ['際に']
    extra:       ['際（に）']
    metrics:     matched=2, precision=0.67, recall=0.67, f1=0.67
  Vocab
    expected:    ['医師', '症状', '相談', '自己判断']
    actual norm: ['医師', '十分', '増やす', '恐れがある', '症状', '相談', '自己判断', '量', '際']
    missing:     []
    extra:       ['十分', '増やす', '恐れがある', '量', '際']
    metrics:     matched=4, precision=0.44, recall=1.00, f1=0.62

[CASE] n2_008
  latency: 6.95s
  Grammar
    expected:    ['ことになりかねない', 'だけでなく', 'にあたって', 'まま']
    actual norm: ['かねない', 'だけでなく', 'ておく', 'にあたって']
    missing:     ['ことになりかねない', 'まま']
    extra:       ['かねない', 'ておく']
    metrics:     matched=2, precision=0.50, recall=0.50, f1=0.50
  Vocab
    expected:    ['なりかねない', '不十分', '住まい', '現地', '生活費']
    actual norm: ['不十分', '住まい', '保険', '出発', '現地', '生活費', '留学']
    missing:     ['なりかねない']
    extra:       ['保険', '出発', '留学']
    metrics:     matched=4, precision=0.57, recall=0.80, f1=0.67

Summary
Analyzer provider: deepseek
Analyzer model:    deepseek-chat (deepseek-v4-flash)
Average latency:   6.71s
Grammar average precision: 0.80
Grammar average recall:    0.69
Grammar average f1:        0.73
Vocab average precision: 0.43
Vocab average recall:    0.79
Vocab average f1:        0.54