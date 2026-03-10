# 🔔 Notification API — Tài Liệu Tích Hợp FE

## Tổng Quan

Hệ thống có **2 loại thông báo** tự động gửi về cho **Quản lý tổng (QLT)**:

| Type                   | Mô tả                                 | Trigger                                          |
| ---------------------- | ------------------------------------- | ------------------------------------------------ |
| `WORK_TIME_CONFLICT`   | Nhân viên bị trùng khung giờ làm việc | Sau `createAssignment` / `temporaryReassignment` |
| `NEW_EMPLOYEE_CREATED` | Nhân viên mới được thêm vào hệ thống  | Sau `createEmployee`                             |

> **Chỉ role QLT** mới có quyền `NOTIFICATION_VIEW` và nhận được thông báo.

---

## Response Object — `NotificationResponse`

```json
{
  "id": 1,
  "type": "WORK_TIME_CONFLICT",
  "typeDescription": "Cảnh báo trùng khung giờ làm việc",
  "title": "⚠️ Cảnh báo trùng khung giờ làm việc",
  "message": "Nhân viên Nguyễn Văn A (NV000001) vừa được phân công vào Hợp đồng ID=5 (08:00–10:00). Phát hiện trùng giờ với Hợp đồng ID=2 (07:00–09:00) vào ngày Thứ Hai.",
  "refEmployeeId": 12,
  "refAssignmentId": 34,
  "refContractId": 5,
  "isRead": false,
  "createdAt": "2026-03-09T13:51:00"
}
```

| Field             | Type          | Mô tả                                                |
| ----------------- | ------------- | ---------------------------------------------------- |
| `id`              | Long          | ID notification                                      |
| `type`            | String        | `WORK_TIME_CONFLICT` hoặc `NEW_EMPLOYEE_CREATED`     |
| `typeDescription` | String        | Mô tả tiếng Việt của loại                            |
| `title`           | String        | Tiêu đề ngắn hiển thị trên chuông                    |
| `message`         | String        | Nội dung chi tiết                                    |
| `refEmployeeId`   | Long          | ID nhân viên liên quan (nullable)                    |
| `refAssignmentId` | Long          | ID phân công liên quan (chỉ có ở WORK_TIME_CONFLICT) |
| `refContractId`   | Long          | ID hợp đồng liên quan (chỉ có ở WORK_TIME_CONFLICT)  |
| `isRead`          | Boolean       | `false` = chưa đọc, `true` = đã đọc                  |
| `createdAt`       | LocalDateTime | Thời điểm tạo                                        |

---

## API Endpoints

### Base URL

```
http://localhost:8080
```

### Header chung (tất cả request đều cần)

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## 1. Kết Nối Real-time (SSE)

> **Gọi 1 lần duy nhất khi QLT login** — kết nối này giữ sống để server tự đẩy về khi có notification mới.

```
GET /api/notifications/subscribe
Accept: text/event-stream
```

**CURL:**

```bash
curl -N -X GET "http://localhost:8080/api/notifications/subscribe" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: text/event-stream"
```

**Server sẽ trả về các event:**

```
# Event xác nhận kết nối thành công (luôn xuất hiện đầu tiên)
event: connected
data: ok

# Event khi có notification mới (server tự đẩy về)
event: notification
data: {"id":1,"type":"NEW_EMPLOYEE_CREATED","typeDescription":"Nhân viên mới được thêm vào hệ thống","title":"👤 Nhân viên mới được thêm vào hệ thống","message":"Nhân viên Trần Thị B (NV000002) vừa được thêm bởi admin vào lúc 09:45 09/03/2026.","refEmployeeId":42,"refAssignmentId":null,"refContractId":null,"isRead":false,"createdAt":"2026-03-09T09:45:00"}
```

**FE Implementation (JavaScript/React):**

```javascript
// Khởi tạo SSE khi user login (chỉ gọi 1 lần)
function connectNotificationSSE(token, onNotification) {
  // Lưu ý: EventSource không truyền header trực tiếp,
  // cần dùng cookie hoặc query param cho token,
  // hoặc dùng thư viện @microsoft/fetch-event-source

  // Cách dùng fetch-event-source (recommended):
  import { fetchEventSource } from "@microsoft/fetch-event-source";

  fetchEventSource("/api/notifications/subscribe", {
    headers: { Authorization: `Bearer ${token}` },
    onopen(res) {
      console.log("SSE connected, status:", res.status);
    },
    onmessage(event) {
      if (event.event === "notification") {
        const notif = JSON.parse(event.data);
        onNotification(notif); // callback: hiện toast + tăng badge
      }
    },
    onerror(err) {
      console.warn("SSE error, sẽ tự reconnect:", err);
    },
    // Tự reconnect khi mất kết nối (mặc định của thư viện)
  });
}
```

---

## 2. Lấy Notification Có Filter

> Gọi khi QLT click mở panel chuông. Hỗ trợ filter **server-side** theo loại và trạng thái.

```
GET /api/notifications?type={type}&isRead={isRead}
```

**Query Parameters:**

| Param    | Bắt buộc | Giá trị                                                 | Mặc định         | Mô tả                                              |
| -------- | -------- | ------------------------------------------------------- | ---------------- | -------------------------------------------------- |
| `type`   | Không    | `ALL` \| `WORK_TIME_CONFLICT` \| `NEW_EMPLOYEE_CREATED` | `ALL`            | Lọc theo loại thông báo                            |
| `isRead` | Không    | `true` \| `false`                                       | _(không truyền)_ | Lọc theo trạng thái đọc. Không truyền = lấy tất cả |

**CURL — Lấy tất cả (không filter):**

```bash
curl -X GET "http://localhost:8080/api/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**CURL — Chỉ lấy cảnh báo trùng giờ, chưa đọc:**

```bash
curl -X GET "http://localhost:8080/api/notifications?type=WORK_TIME_CONFLICT&isRead=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**CURL — Chỉ lấy thông báo nhân viên mới:**

```bash
curl -X GET "http://localhost:8080/api/notifications?type=NEW_EMPLOYEE_CREATED" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**CURL — Chỉ các thông báo đã đọc:**

```bash
curl -X GET "http://localhost:8080/api/notifications?isRead=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**CURL — Chỉ thông báo chưa đọc (tất cả loại):**

```bash
curl -X GET "http://localhost:8080/api/notifications?isRead=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**

```json
[
  {
    "id": 2,
    "type": "WORK_TIME_CONFLICT",
    "typeDescription": "Cảnh báo trùng khung giờ làm việc",
    "title": "⚠️ Cảnh báo trùng khung giờ làm việc",
    "message": "Nhân viên Nguyễn Văn A (NV000001) vừa được phân công vào Hợp đồng ID=5 (08:00–10:00). Phát hiện trùng giờ với Hợp đồng ID=2 (07:00–09:00) vào ngày Thứ Hai.",
    "refEmployeeId": 12,
    "refAssignmentId": 34,
    "refContractId": 5,
    "isRead": false,
    "createdAt": "2026-03-09T13:51:00"
  },
  {
    "id": 1,
    "type": "NEW_EMPLOYEE_CREATED",
    "typeDescription": "Nhân viên mới được thêm vào hệ thống",
    "title": "👤 Nhân viên mới được thêm vào hệ thống",
    "message": "Nhân viên Trần Thị B (NV000002) vừa được thêm bởi admin vào lúc 09:45 09/03/2026.",
    "refEmployeeId": 42,
    "refAssignmentId": null,
    "refContractId": null,
    "isRead": true,
    "createdAt": "2026-03-09T09:45:00"
  }
]
```

> ✅ **FE tự filter theo loại và trạng thái đọc** — API trả về tất cả, FE xử lý filter phía client.

---

## 3. Lấy Chỉ Notification Chưa Đọc

```
GET /api/notifications/unread
```

**CURL:**

```bash
curl -X GET "http://localhost:8080/api/notifications/unread" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):** Mảng các notification có `isRead: false`, format giống mục 2.

---

## 4. Đếm Số Chưa Đọc (Badge)

> Gọi khi load trang để hiển thị số đỏ trên icon chuông.

```
GET /api/notifications/unread/count
```

**CURL:**

```bash
curl -X GET "http://localhost:8080/api/notifications/unread/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**

```json
{
  "count": 3
}
```

---

## 5. Đánh Dấu 1 Notification Đã Đọc

> Gọi khi QLT click vào 1 notification trong danh sách.

```
PUT /api/notifications/{id}/read
```

**CURL:**

```bash
curl -X PUT "http://localhost:8080/api/notifications/2/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):** Notification đã được update `isRead: true`.

```json
{
  "id": 2,
  "type": "WORK_TIME_CONFLICT",
  "isRead": true,
  ...
}
```

---

## 6. Đánh Dấu Tất Cả Đã Đọc

> Gọi khi QLT click "Đánh dấu tất cả đã đọc".

```
PUT /api/notifications/read-all
```

**CURL:**

```bash
curl -X PUT "http://localhost:8080/api/notifications/read-all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):** Không có body.

---

## Thiết Kế UI — Panel Chuông Thông Báo

### Layout Đề Xuất

```
┌─────────────────────────────────────────────────┐
│  Header:  [Logo]  ...menu...  👤 Nguyễn QLT  🔔3 │
└─────────────────────────────────────────────────┘
                                          ↓ click 🔔
┌──────────────────────────────────────────────────┐
│  🔔 Thông báo                    [Đánh dấu tất cả đã đọc] │
├──────────────────────────────────────────────────┤
│  🔍 Lọc theo loại:                               │
│  [Tất cả] [⚠️ Trùng giờ] [👤 Nhân viên mới]     │
│  [Chưa đọc] [Đã đọc]                            │
├──────────────────────────────────────────────────┤
│  ● ⚠️ Cảnh báo trùng khung giờ làm việc          │
│     NV Nguyễn Văn A bị trùng giờ HĐ#2 và HĐ#5  │
│     13:51 - 09/03/2026                           │
├──────────────────────────────────────────────────┤
│    👤 Nhân viên mới được thêm vào hệ thống       │
│     NV Trần Thị B (NV000002) được thêm bởi admin│
│     09:45 - 09/03/2026              [Đã đọc ✓]  │
└──────────────────────────────────────────────────┘
```

### Logic FE

```javascript
// State management
const [notifications, setNotifications] = useState([]);
const [filterType, setFilterType] = useState("ALL"); // ALL | WORK_TIME_CONFLICT | NEW_EMPLOYEE_CREATED
const [filterRead, setFilterRead] = useState("ALL"); // ALL | UNREAD | READ
const [badgeCount, setBadgeCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);

// 1. Load badge count khi mount
useEffect(() => {
  fetchBadgeCount();
  connectSSE(); // Kết nối SSE real-time
}, []);

async function fetchBadgeCount() {
  const res = await fetch("/api/notifications/unread/count", { headers });
  const data = await res.json();
  setBadgeCount(data.count);
}

// 2. Khi click mở panel → load danh sách
async function onOpenPanel() {
  setIsOpen(true);
  const res = await fetch("/api/notifications", { headers });
  const data = await res.json();
  setNotifications(data);
}

// 3. Filter phía client
const filteredNotifications = notifications
  .filter((n) => filterType === "ALL" || n.type === filterType)
  .filter((n) => {
    if (filterRead === "UNREAD") return !n.isRead;
    if (filterRead === "READ") return n.isRead;
    return true;
  });

// 4. SSE callback — khi nhận notification mới
function onNewNotification(notif) {
  setNotifications((prev) => [notif, ...prev]); // Thêm vào đầu danh sách
  setBadgeCount((prev) => prev + 1); // Tăng badge
  showToast(notif.title, notif.message); // Hiện toast (tùy thư viện)
}

// 5. Click vào 1 notification
async function onClickNotification(notif) {
  if (!notif.isRead) {
    await fetch(`/api/notifications/${notif.id}/read`, {
      method: "PUT",
      headers,
    });
    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
    );
    setBadgeCount((prev) => Math.max(0, prev - 1));
  }
  // Navigate đến trang liên quan
  if (notif.type === "WORK_TIME_CONFLICT" && notif.refEmployeeId) {
    navigate(`/employees/${notif.refEmployeeId}`);
  } else if (notif.type === "NEW_EMPLOYEE_CREATED" && notif.refEmployeeId) {
    navigate(`/employees/${notif.refEmployeeId}`);
  }
}

// 6. Đánh dấu tất cả đã đọc
async function onMarkAllRead() {
  await fetch("/api/notifications/read-all", { method: "PUT", headers });
  setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  setBadgeCount(0);
}
```

---

## Flow Hoàn Chỉnh

```
QLT Login
  │
  ├── GET /notifications/unread/count → hiển thị badge 🔔3
  │
  └── SSE /notifications/subscribe ──────────────────────────┐
                                                             │
  [Ai đó createEmployee]                                     │
       └── BE tự động push SSE event "notification" ────────►│
                                                    FE nhận  │
                                                    ├── badge +1
                                                    └── toast hiện lên

  QLT click 🔔
  └── GET /notifications → danh sách đầy đủ
       ├── FE filter theo [type] và [đọc/chưa]
       └── Click 1 item → PUT /{id}/read → navigate đến trang liên quan
```

---

## Error Responses

| HTTP Code | Trường hợp                                               |
| --------- | -------------------------------------------------------- |
| `401`     | Token hết hạn hoặc không có                              |
| `403`     | User không có quyền `NOTIFICATION_VIEW` (không phải QLT) |
| `404`     | Notification ID không tồn tại (khi mark as read)         |
| `403`     | Cố mark as read notification của người khác              |
