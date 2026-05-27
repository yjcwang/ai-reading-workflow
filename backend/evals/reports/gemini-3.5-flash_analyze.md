[CASE] n2_001
  latency: 10.63s
  Grammar
    expected:    ['おかげで', 'からといって', 'ものの']
    actual norm: ['おかげで', 'からといって', 'ものの']
    missing:     []
    extra:       []
    metrics:     matched=3, precision=1.00, recall=1.00, f1=1.00
  Vocab
    expected:    ['丁寧', '慣れる', '職場', '自信をなくす']
    actual norm: ['丁寧', '慣れる', '職場', '自信']
    missing:     ['自信をなくす']
    extra:       ['自信']
    metrics:     matched=3, precision=0.75, recall=0.75, f1=0.75

[CASE] n2_002
  latency: 10.15s
  Grammar
    expected:    ['ざるを得ない', 'とたん', 'とは思ってもみなかった']
    actual norm: ['ざるを得ない', 'たとたん', 'とは思ってもみなかった']
    missing:     ['とたん']
    extra:       ['たとたん']
    metrics:     matched=2, precision=0.67, recall=0.67, f1=0.67
  Vocab
    expected:    ['ざるを得ない', '降り出す']
    actual norm: ['友人', '急に', '昔']
    missing:     ['ざるを得ない', '降り出す']
    extra:       ['友人', '急に', '昔']
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00

[CASE] n2_003
  latency: 10.22s
  Grammar
    expected:    ['だけでなく', 'に関して', 'べき', '一方で']
    actual norm: ['に関して', 'べき', '一方で']
    missing:     ['だけでなく']
    extra:       []
    metrics:     matched=3, precision=1.00, recall=0.75, f1=0.86
  Vocab
    expected:    ['改善', '求められる', '生活環境', '行政', '観光地']
    actual norm: ['住民', '協力', '改善', '行政', '観光地']
    missing:     ['求められる', '生活環境']
    extra:       ['住民', '協力']
    metrics:     matched=3, precision=0.60, recall=0.60, f1=0.60

[CASE] n2_004
  latency: 10.31s
  Grammar
    expected:    ['にもかかわらず', 'ようだ', 'ようになってきた']
    actual norm: ['にもかかわらず', 'の結果', 'ようになる']
    missing:     ['ようだ', 'ようになってきた']
    extra:       ['の結果', 'ようになる']
    metrics:     matched=1, precision=0.33, recall=0.33, f1=0.33
  Vocab
    expected:    ['努力', '欠かさず', '結果']
    actual norm: ['努力', '文章', '欠かさず']
    missing:     ['結果']
    extra:       ['文章']
    metrics:     matched=2, precision=0.67, recall=0.67, f1=0.67

[CASE] n2_005
  latency: 10.64s
  Grammar
    expected:    ['たほうがよい', 'ためには', 'だけに', 'とともに']
    actual norm: ['だけに', 'とともに']
    missing:     ['たほうがよい', 'ためには']
    extra:       []
    metrics:     matched=2, precision=1.00, recall=0.50, f1=0.67
  Vocab
    expected:    ['発言', '簡潔', '結論', '表情', '誤解', '述べる']
    actual norm: ['発言', '簡潔', '結論', '表情', '避ける']
    missing:     ['誤解', '述べる']
    extra:       ['避ける']
    metrics:     matched=4, precision=0.80, recall=0.67, f1=0.73

[CASE] n2_006
  latency: 9.08s
  Grammar
    expected:    ['ことがある', 'ことになっている', 'なしに', 'までに']
    actual norm: ['ことがある', 'ことになっている', 'なしに']
    missing:     ['までに']
    extra:       []
    metrics:     matched=3, precision=1.00, recall=0.75, f1=0.86
  Vocab
    expected:    ['受け付ける', '来店']
    actual norm: ['受け付ける', '変更', '来店']
    missing:     []
    extra:       ['変更']
    metrics:     matched=2, precision=0.67, recall=1.00, f1=0.80

[CASE] n2_007
  latency: 10.79s
  Grammar
    expected:    ['ことなく', '恐れがある', '際に']
    actual norm: ['ことなく', '恐れがある', '際に']
    missing:     []
    extra:       []
    metrics:     matched=3, precision=1.00, recall=1.00, f1=1.00
  Vocab
    expected:    ['医師', '症状', '相談', '自己判断']
    actual norm: ['医師', '症状', '自己判断']
    missing:     ['相談']
    extra:       []
    metrics:     matched=3, precision=1.00, recall=0.75, f1=0.86

[CASE] n2_008
  latency: 13.90s
  Grammar
    expected:    ['ことになりかねない', 'だけでなく', 'にあたって', 'まま']
    actual norm: ['かねない', 'にあたって']
    missing:     ['ことになりかねない', 'だけでなく', 'まま']
    extra:       ['かねない']
    metrics:     matched=1, precision=0.50, recall=0.25, f1=0.33
  Vocab
    expected:    ['なりかねない', '不十分', '住まい', '現地', '生活費']
    actual norm: ['不十分', '住まい', '現地', '生活費']
    missing:     ['なりかねない']
    extra:       []
    metrics:     matched=4, precision=1.00, recall=0.80, f1=0.89

Summary
Analyzer provider: gemini
Analyzer model:    gemini-3.5-flash
Average latency:   10.71s
Grammar average precision: 0.81
Grammar average recall:    0.66
Grammar average f1:        0.71
Vocab average precision: 0.69
Vocab average recall:    0.65
Vocab average f1:        0.66