'use client';
import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { exploreVideos, type ExploreVideo } from '@/lib/exploreVideos';

function VideoCard({ video }: { video: ExploreVideo }) {
 const [loaded, setLoaded] = useState(false);
 const [failed, setFailed] = useState(false);
 return <figure className="explore-video-card">
  <div className="explore-video-frame">
   {loaded && !failed ? <video controls playsInline preload="metadata" src={video.url} aria-label={video.title} onError={() => setFailed(true)}>
    Trình duyệt không hỗ trợ video. Hãy dùng liên kết video gốc bên dưới.
   </video> : <div className="explore-video-placeholder"><Play size={30} aria-hidden="true"/><span>{failed ? 'Video chưa tải được. Bạn có thể xem video gốc bên dưới.' : video.originalTitle}</span>{failed ? <button type="button" onClick={() => { setFailed(false); setLoaded(true); }}>Thử tải lại</button> : <button type="button" onClick={() => setLoaded(true)} aria-label={'Tải video: ' + video.title}>Tải trình phát video</button>}</div>}
  </div>
  <figcaption><p className="explore-video-publisher">{video.publisher} · Video tham khảo</p><h4>{video.title}</h4><p><strong>Gợi ý quan sát:</strong> {video.focus}</p><p className="explore-video-scope">{video.scope}</p><div className="explore-video-links"><a href={video.url} target="_blank" rel="noopener noreferrer">Xem video gốc <ExternalLink size={14} aria-hidden="true"/></a><a href={video.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn nhà sản xuất <ExternalLink size={14} aria-hidden="true"/></a></div></figcaption>
 </figure>;
}

export default function ExploreVideos({ equipmentId }: { equipmentId: string }) {
 const videos = exploreVideos[equipmentId];
 if (!videos?.length) return null;
 return <section className="explore-videos" aria-labelledby={'videos-' + equipmentId}><h3 id={'videos-' + equipmentId}>Quan sát qua video</h3><p className="explore-video-intro">Video từ nhà sản xuất giúp liên hệ nội dung nghiên cứu với thiết bị thực tế. Chọn tải trình phát, sau đó nhấn phát để xem.</p><div className="explore-video-grid">{videos.map(video => <VideoCard key={video.id} video={video}/>)}</div></section>;
}
