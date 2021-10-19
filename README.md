# DiscordBot
功能:

- 預測投票
    - 開盤 !start [title] [blue] [red]
    - 下注!red [points]
    - 查詢投票情況!vote
    - 收盤!end [blue/red]
- 累積點數
    - 建立個人DB!join
    - 查詢點數!mypt
    - 累積方式???
- 上傳精華
    
    查詢精華!h
    

## !start complete

---

傳送公告(embed)

bet.organizers=msg.author

bet.status=true

時間限制？

## !red !blue complete

---

Reply下注多少/點數不足

個人扣點

個人DB.voting =true

DB.voting.points 增加

## !vote complete

---

傳送bet 內容(embed):紅藍方點數、計算賠率

## !end complete

---

檢查msg.author 是否為bet.organizers 

公告獲勝方

根據個人DB個別tag發放：point增/減

bet.status=false

## !join complete

---

檢查DB中有無此user

若無就新增

## !mypt complete

---

查找DB中個人points

Reply
