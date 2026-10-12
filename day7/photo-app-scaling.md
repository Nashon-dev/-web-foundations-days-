# SnapShare Photo-App Scaling Plan

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and view a feed containing photos from people they follow.

The following assumptions are used:

- Registered users: 10,000,000.
- Daily active users: 10% of registered users.
- Each daily active user uploads 1 photo per day.
- Each daily active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Average thumbnail size: 50 KB.
- One day has 86,400 seconds, and one year has 365 days.
- Peak traffic is five times the average traffic.
- Every uploaded photo generates one thumbnail.
- Uploaded photos and thumbnails are retained for one year, with no deletions.
- Storage calculations use decimal units: 1 TB = 1,000,000 MB. Replicas, backups, and additional storage overhead are excluded.
- Feed views represent page requests, not individual photos displayed.

## 2. Traffic and Storage Calculations

### A. Daily active users

Daily active users (DAU) = Registered users × Daily activity rate

DAU = 10,000,000 × 10%

**Daily active users = 1,000,000**

### B. Photo uploads per second

Daily uploads = 1,000,000 active users × 1 photo

Daily uploads = 1,000,000 photos.

Average uploads per second = 1,000,000 ÷ 86,400

**Average uploads = approximately 11.57 photos per second.**

### C. Feed views per second

Daily feed views = 1,000,000 active users × 50 feed pages

Daily feed views = 50,000,000 pages.

Average feed views per second = 50,000,000 ÷ 86,400

**Average feed views = approximately 579 pages per second.**

Peak feed views per second = 579 × 5

**Peak feed views = approximately 2,894 pages per second.**

The system should therefore handle short periods of substantially higher traffic than the daily average.

### D. Photo storage per year

Annual uploads = 1,000,000 × 365

Annual uploads = 365,000,000 photos.

Original photo storage:

365,000,000 × 2 MB = 730,000,000 MB

**Original photo storage = 730 TB per year.**

Thumbnail storage:

365,000,000 × 50 KB = 18,250,000,000 KB

**Thumbnail storage = 18.25 TB per year.**

Total annual photo storage:

730 TB + 18.25 TB = 748.25 TB

**Total storage = approximately 748.25 TB per year**, excluding replicas, backups, and other overhead.

## 3. Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users request 50 feed pages per day but upload only one photo per day.

The workload has approximately 50 feed-page views per upload. Therefore, the design should optimize feed delivery using a CDN, caching, read replicas, and horizontally scalable application servers while still supporting reliable photo uploads.

## 4. Why Photos Should Not Be Stored Inside the Database

Photos are large binary files that would consume substantial database storage and increase backup, replication, and retrieval costs. Storing them in object storage is more scalable and cost-effective.

SnapShare should store original photos and thumbnails in **object storage**, such as an S3-compatible service, and store their URLs or object keys, ownership information, timestamps, and other metadata in the database.

## 5. Architecture Diagram

```text
                    +------------------+
                    |       Users      |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |       CDN        |
                    | Cached photos    |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |  Load Balancer   |
                    +--------+---------+
                             |
                +------------+------------+
                |            |            |
                v            v            v
          +----------+ +----------+ +----------+
          | App      | | App      | | App      |
          | Server 1 | | Server 2 | | Server N |
          +----+-----+ +----+-----+ +----+-----+
               |            |            |
               +------------+------------+
                             |
                +------------+-------------+
                |                          |
                v                          v
        +---------------+          +----------------+
        | Cache         |          | Message Queue  |
        | Feed / Metadata|         | Thumbnail Jobs |
        +-------+-------+          +-------+--------+
                |                          |
                v                          v
        +---------------+          +----------------+
        | Primary DB    |          | Thumbnail      |
        |               |          | Worker         |
        +-------+-------+          +-------+--------+
                |                          |
                v                          v
        +---------------+          +----------------+
        | Read Replica  |          | Object Storage |
        |               |          | Originals and  |
        +---------------+          | Thumbnails     |
                                   +----------------+
                                           |
                                           v
                                   +----------------+
                                   |       CDN      |
                                   | Photo delivery |
                                   +----------------+
```

The CDN is used for photo delivery, while the load balancer routes application requests to available application servers. The message queue and thumbnail worker handle image processing asynchronously.

## 6. What Each Component Solves

1. **Users:** Upload photos and request feeds containing content from people they follow.
2. **CDN:** Caches and delivers photos from locations closer to users, reducing latency and load on the origin storage.
3. **Load balancer:** Distributes incoming requests across application servers to avoid overloading a single server.
4. **Application servers:** Authenticate users, validate uploads, process feed requests, and coordinate database, cache, and storage operations.
5. **Cache:** Stores frequently requested feed data and metadata to reduce repeated database queries and improve response times.
6. **Primary database:** Stores durable application data such as users, follows, photo metadata, and feed relationships.
7. **Read replica:** Serves eligible read queries to reduce load on the primary database and improve read capacity.
8. **Object storage:** Stores original photo files and generated thumbnails without filling the relational database with large binary files.
9. **Message queue:** Holds thumbnail-generation jobs so uploads can finish without waiting for image processing.
10. **Thumbnail worker:** Consumes queued jobs, generates smaller thumbnail images, and saves them to object storage.
11. **CDN photo-delivery path:** Retrieves and caches stored originals or thumbnails so repeated photo requests do not always reach object storage.

## 7. Step-by-Step Photo Upload Flow

1. A user selects a photo and submits it through the SnapShare application.
2. The application server authenticates the user and validates the file type, size, and upload permissions.
3. The original photo is uploaded to object storage, which returns or confirms its object key.
4. The application saves the photo metadata, owner, timestamp, and object key in the primary database.
5. The application places a thumbnail-generation job on the message queue.
6. The application responds to the user that the photo has been uploaded successfully, without waiting for the thumbnail to finish.
7. A thumbnail worker retrieves the job from the queue and downloads or reads the original photo from object storage.
8. The worker resizes the image and generates a thumbnail of approximately 50 KB.
9. The worker stores the thumbnail in object storage and updates the photo metadata to indicate that the thumbnail is ready.
10. When followers request their feeds, application servers retrieve the relevant photo metadata and return photo URLs; the CDN delivers cached images or fetches them from object storage when needed.

The thumbnail job can be retried if processing fails, and the application should track whether a thumbnail is pending, ready, or failed.

## 8. Trade-Offs

### Trade-off 1: CDN caching versus freshness

A CDN reduces latency and origin traffic, but cached photos or metadata may become stale after an update or deletion. SnapShare can use cache expiration rules and cache invalidation when content changes.

### Trade-off 2: Read replicas versus consistency

Read replicas increase read capacity, but replication lag can cause a recently uploaded photo or updated feed to be temporarily missing from a read. The application can direct critical read-after-write requests to the primary database.

### Trade-off 3: Asynchronous thumbnails versus immediate availability

A message queue allows uploads to finish quickly and absorbs processing spikes, but thumbnails may not be available immediately. The feed should display a placeholder or original image until the thumbnail is ready.

### Trade-off 4: Object storage versus direct database storage

Object storage scales more economically for large image files, but it adds another service to manage and requires coordination between stored files and database metadata. SnapShare should use stable object keys, retry failed operations, and periodically clean up orphaned files.

## 9. Conclusion

SnapShare has 1 million daily active users, approximately 11.57 photo uploads per second, 579 average feed views per second, and 2,894 peak feed views per second. It requires approximately 748.25 TB of new photo and thumbnail storage per year under the stated assumptions.

Because the application is read-heavy, it should use a CDN, caching, scalable application servers, and database read replicas. Object storage should hold photo files, while a message queue and thumbnail worker provide reliable asynchronous image processing.